;(function(){
  'use strict';

  angular
    .module('ngFit.main',['ngRoute', 'infinite-scroll', 'ngAffix', 'ngFit.fitfire.service'])
    .config(MainConfig)
    .controller('MainCtrl', MainCtrl)

  MainCtrl.$inject = ['$scope', '$rootScope', 'FIREBASE_URL', '$log', 'fitfireService', 'usersFactory', '$timeout', 'fitfireService'];
  function MainCtrl($scope, $rootScope, FIREBASE_URL, $log, currentProvider, usersFactory, $timeout, fitfireService){
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

    vm.sortTo = false;
    vm.sortBy = '$id';
    vm.update = 0;

    vm.sortByColumn = function(name){
      vm.sortBy = name;
      vm.sortTo = !vm.sortTo;
      //$scope.$apply();
    }

    vm.users = usersFactory.users;
    vm.usersLength = vm.users.length;

    $scope.$on('ListObjectChanged', function(){
      //console.log('main.js ListObjectChanged', vm.usersLength, vm.users.length);
      if(vm.usersLength != vm.users.length){
        //console.log('$rootScope.currentUser', vm.usersLength, vm.users.length);
        $timeout(function(){
          ++vm.update;
          vm.usersLength = vm.users.length;
        }, 10);
      }
    });


    vm.usersList = [];
    vm.loadMoreUsersWork = false;
    vm.userMoreLoadLimit = 6;
    vm.userMoreLoadStart = '0';
    vm.userMoreLoadNonStop = true;
    vm.userMoreLoadHasMore = true;

    vm.loadMoreUsers = function(loadMoreBtn){
      if(vm.loadMoreUsersWork) return;
      vm.loadMoreUsersWork = true;
      $('#' + loadMoreBtn).button('loading');
      fitfireService.getJSONData(vm.userMoreLoadStart, vm.userMoreLoadLimit).then(function(data){
        vm.usersList = vm.usersList.concat(data);
        $('#' + loadMoreBtn).button('reset');
        vm.loadMoreUsersWork = false;
        vm.userMoreLoadStart = '' + (parseInt(vm.userMoreLoadStart) + data.length);
        if(data.length ===  0){
          if(vm.userMoreLoadNonStop) vm.userMoreLoadStart = '0';
          else vm.userMoreLoadHasMore = false;
        }
      })
    }

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