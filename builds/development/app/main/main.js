;(function(){
  'use strict';

  angular
    .module('ngFit.main',['ngRoute', 'ngFit.fitfire.service'])
    .config(MainConfig)
    .controller('MainCtrl', MainCtrl)

  MainCtrl.$inject = ['$scope', '$rootScope', 'FIREBASE_URL', '$log', 'fitfireService'];
  function MainCtrl($scope, $rootScope, FIREBASE_URL, $log, fitfireService){
    var vm = this;
    $rootScope.curPath = 'main';
    $rootScope.pageClass = 'page-main';

    var currentProvider = fitfireService;

    vm.userProvider = '"fitfireService"';

    vm.url = FIREBASE_URL;
    vm.title = 'Это наш MainCtrl';

    vm.name = 'Loftschool';

    vm.userForm = false;

    if($rootScope.needAuth) $('#sign-in-modal').modal('show');

    vm.user = {
      id: null,
      name: null,
      age: 0
    }

    currentProvider.getUsers(function(data){
      vm.users = data;
    });

    currentProvider.getUsers().then(function(data){
      vm.users = data;
    }).catch(function(err){
      $log.debug(err);
    });

    vm.openCloseUserForm = function(key, reset){
      if(reset) vm.defaultUser();
      vm.userForm = key?true:false;
    }

    vm.defaultUser = function(name, age){
      vm.user = {
        id: null,
        name: null,
        age: 0
      }
    }

    vm.addUser = function(){
      currentProvider.addUser(vm.user).then(function(){
        vm.openCloseUserForm(0, 1);
      });
    }

    vm.updateUser = function(){
      currentProvider.updateUser(vm.user).then(function(){
        vm.openCloseUserForm(0, 1);
      });
    }

    vm.deleteUser = function(user){
      if(user) vm.user = user;
      currentProvider.deleteUser(vm.user).then(function(){
        vm.openCloseUserForm(0, 1);
      });
    }

    vm.setEdit = function(user){
      if($rootScope.currentUser.isAnonymous) return;
      vm.user = user;
      vm.openCloseUserForm(1);
    }

    vm.defaultUser();

    $scope.clickFunction = function(name){
      alert('Hi, ' + name);
    }

  }

  MainConfig.$inject = ['$routeProvider'];
  function MainConfig($routeProvider){

    $routeProvider
      .when('/', {
        templateUrl: '/app/main/main.html',
        controller: 'MainCtrl',
        controllerAs: 'vm'
      });

  }

})();