;(function(){
  'use strict';

  angular.module('ngFit.auth.http', [])
    .constant('SERVER_URL', 'http://62.109.17.114/')
    .factory('Auth', AuthFactory)

  AuthFactory.$inject = ['$http', '$log', 'SERVER_URL', '$cookies'];
  function AuthFactory($http, $log, SERVER_URL, $cookies) {
    //delete $http.defaults.headers.common['X-Requested-With'];
    //$http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
    var auth_token = 'xxxxYYYYZzzz';
    var user_id = '1';
    var auth = {};

    auth.user = null;

    auth.login = function(_username, _password, cb){
      var auth_url = SERVER_URL + 'auth?login=' + _username + '&password=' + _password;
      return $http({
        method: 'GET',
        url: auth_url,
        dataType: 'jsonp',
        headers: {'Authorization': 'Token token=xxxxYYYYZzzz'}
      })
        .success(function(status){
          alert('Success = ' + status);
        })
        .error(function(status){
          //$log.debug('auth.login = ');
          $cookies.put('auth_token', auth_token);
          $cookies.put('user_id', user_id);
          $cookies.put('username', _username);
          auth.user = {
            id: user_id,
            username: _username,
            hash: {}
          }
          if(cb) cb(auth.user);
          $('#sign-in-modal').modal('hide');
        });
    }

    auth.logout = function(){
      auth.user = null;
      $cookies.remove('auth_token');
      $cookies.remove('user_id');
      $cookies.remove('username');
    }

    auth.getUserName = function(){
      if(auth.user && auth.user.username){
        return auth.user.username
      }else if($cookies.get('username')){
        return $cookies.get('username');
      }
      return null;
    }

    return auth;
  }
})();
