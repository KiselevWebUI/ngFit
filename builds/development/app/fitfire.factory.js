;(function(){
  'use strict';

  angular
    .module('ngFit.fitfire.factory', ['firebase'])
    .factory('fitfireFactory', fitfireFactory);

  fitfireFactory.$inject = ['$log', 'firebaseConfig', '$firebaseObject', '$firebaseArray'];
  function fitfireFactory($log, firebaseConfig, $firebaseObject, $firebaseArray){

    if(!firebase.isInit){
      firebase.initializeApp(firebaseConfig);
      firebase.isInit = true;
    }

    var dataBase = firebase.database();

    function addUser(user){
      var userLength = $firebaseObject(dataBase.ref('options/userLength'));
      return userLength.$loaded(function() {
        var newLength = ++userLength.$value;
        userLength.$save();
        var users = dataBase.ref('users');
        users.child(newLength).set(user);
      });
    }

    function updateUser(_user){
      var user = dataBase.ref('users/' + _user.$id);
      user.set({
        name: _user.name,
        age: _user.age
      });
      return $firebaseArray(user).$loaded();
    }

    function deleteUser(_user){
      var user = dataBase.ref('users/' + _user.$id);
      user.remove();
      return $firebaseArray(user).$loaded();
    }

    function setLogedNowUser(_user, key){
      var user = dataBase.ref('users/' + _user.$id);
      user.set({
        logedNow: key?true:false
      });
    }

    function getUsers(cb){
      var users = $firebaseArray(dataBase.ref('users'));
      return users.$loaded(cb);
    }

    return function(){
      return getUsers().then(function(data){
        return {
          users: data,
          addUser: addUser,
          updateUser: updateUser,
          deleteUser: deleteUser,
          setLogedNowUser: setLogedNowUser
        };
      });
    }

  }
})();

