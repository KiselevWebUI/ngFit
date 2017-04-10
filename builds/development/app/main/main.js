;(function(){
  'use strict';

  angular
    .module('ngFit.main',['ngRoute', 'ngFit.fitfire.service'])
    .config(MainConfig)
    .controller('MainCtrl', MainCtrl)

  MainCtrl.$inject = ['$scope', '$rootScope', 'FIREBASE_URL', '$log', 'fitfireService', 'usersFactory'];
  function MainCtrl($scope, $rootScope, FIREBASE_URL, $log, currentProvider, usersFactory){
    var vm = this;
    $rootScope.curPath = 'main';
    $rootScope.pageClass = 'page-main';


    vm.userProvider = '"fitfireService"';

    vm.url = FIREBASE_URL;
    vm.title = 'Это наш MainCtrl';

    vm.name = 'Loftschool';

    vm.userForm = false;

    if($rootScope.needAuth) $('#sign-in-modal').modal('show');

    vm.equalsCell = true;

    vm.sortByColumn = function(name){
      vm.sortBy = name;
      vm.sortTo = !vm.sortTo;
      //$scope.$apply();
    }

    vm.sortTo = false;
    vm.sortBy = '$id';

    vm.users = usersFactory.users;

    /*currentProvider.getUsers(function(data){
      vm.users = data;
    });

    currentProvider.getUsers().then(function(data){
      vm.users = data;
      vm.sortTo = false;
      vm.sortBy = '$id';
    }).catch(function(err){
      $log.debug(err);
    });*/

  }

  MainConfig.$inject = ['$routeProvider'];
  function MainConfig($routeProvider){

    $routeProvider
      .when('/', {
        templateUrl: '/app/main/main.html',
        controller: 'MainCtrl',
        controllerAs: 'vm',
        resolve: {
          /* @ngInject */
          usersFactory: function(fitfireFactory){
            return fitfireFactory();
          }
        }
      });

  }

})();