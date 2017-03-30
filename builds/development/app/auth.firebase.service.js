;(function(){
  'use strict';

  angular.module('ngFit.auth.firebase', ['firebase'])
    .factory('Auth', AuthenticationFactory)

  AuthenticationFactory.$inject = ['$rootScope', 'firebaseConfig', '$log', '$cookies', '$q', '$location'];
  function AuthenticationFactory($rootScope, firebaseConfig, $log, $cookies, $q, $location){

    if(!firebase.isInit){
      firebase.initializeApp(firebaseConfig);
      firebase.isInit = true;
    }

    var auth = {};

    auth.getCurrentUser = function(cb){
      return firebase.auth().onAuthStateChanged(function(user) {
        if(user) {
          updateCurrentUser(user);
          if(cb) cb(user);
          $log.debug('auth.getCurrentUser currentUser = ' + user);
        } else {
          updateCurrentUser();
          $log.debug('Not user');
        }
      });

    }

    auth.getCurrentUser();

    auth.updateProfile = function(name, url, cb){
      var user = firebase.auth().currentUser;
      if(user){
        var hash = {owner: 'null'};
        if(name) hash.displayName = name;
        if(url) hash.photoURL = url;
        user.updateProfile(hash)
          .then(function() {
            user = firebase.auth().currentUser;
            updateCurrentUser(user);
            if(cb) cb(user);
          }, function(error){
            updateCurrentUser();
            if(cb) cb(null, error);
          })
      }else{
        $log.debug('Not user');
      }

    }

    auth.createNewUser = function(email, password, cb){
      return firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function(data){
          updateCurrentUser(data);
          if(cb) cb(data);
        })
        .catch(function(error) {
          updateCurrentUser();
          if(cb) cb(null, error);
          $log.error('Login error = ' + error);
        });
    }

    auth.signInAnonymously = function(cb){
      return firebase.auth().signInAnonymously()
        .then(function(user){
          updateCurrentUser(user);
          if(cb) cb(user);
        })
        .catch(function(error) {
          updateCurrentUser();
          if(cb) cb(null, error);
        });
    }

    auth.convertAnonymous = function(email, password, cb){
      var credential = firebase.auth.EmailAuthProvider.credential(email, password);
      var user = firebase.auth().currentUser;
      user.link(credential).then(
        function(user) {
          $log.debug("Anonymous account successfully upgraded", user);
          if(cb) cb(user);
        },function(error) {
          $log.debug("Error upgrading anonymous account", error);
          if(cb) cb(null, error);
        }
      );
    }

    auth.login = function(email, password, cb){
      return firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function(data){
          updateCurrentUser(data);
          if(cb) cb(data);
        })
        .catch(function(error) {
          updateCurrentUser();
          if(cb) cb(null, error);
          $log.error('Login error = ' + error);
        });
    };

    auth.logout = function(cb){
      return firebase.auth().signOut()
        .then(function(data) {
          updateCurrentUser();
          if(cb) cb(data);
        }).catch(function(error) {
          updateCurrentUser();
          if(cb) cb(null, error);
          $log.debug('Logout error');
        });
    };

    function updateCurrentUser(user){
      if(user){
        $rootScope.currentUser = user;
        $cookies.put('uid', user.uid);
        $rootScope.needAuth = false;
      }else{
        $rootScope.currentUser = null;
        $cookies.remove('uid');
      }
    }

    auth.getUserName = function(){
      if(!$cookies.get('uid'))
        return null;
      else
        return $cookies.get('uid');
    }

    auth.signedIn = function(){
      if(auth.getUserName()){
        return true;
      }else{
        $location.path('/#');
        $rootScope.needAuth = true;
        return $q.reject({unAuthorized: true});
      }
    }

    $rootScope.signedIn = function(){
      return !!auth.getUserName();
    };

    return auth;
  }

})();
