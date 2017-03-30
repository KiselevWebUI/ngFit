;(function(){
  'use strict';

  angular.module('ngFit.tests', ['ngRoute', 'ngAnimate', 'infinite-scroll', 'ngAffix', 'ngFit.fitfire.service'])
    .config(TestsConfig)
    .animation('.animate-new', function(){
      return{
        enter: function(element, done){
          console.log('enter');
        },
        leave: function(element, done){
          console.log('leave');
        },
        move: function(element, done){
          console.log('move');
        },
        //show
        addClass: function(element, newClass, done){
          console.log('addClass ', newClass);
          element.css('border', '1px solid red');
        },
        //hide
        removeClass: function(element, removeClass, done){
          console.log('removeClass ', removeClass);
          element.css('border', '3px solid blue');
        }
      }
    })
    .controller('TestsCtrl', TestsCtrl)
    .factory('Son', Son);

  Son.$inject = ['$q', '$log'];
  function Son ($q, $log){
    var o = {};

    o.go2Shop = function(){
      var deferred = $q.defer();


      setTimeout(function(){
        deferred.notify('Я пошел в магазин ' + new Date());
      }, 10);

      setTimeout(function(){
        deferred.notify('Я пришел в магазин ' + new Date());

        var eggs = parseInt(Math.random()*10);

        if(eggs % 2){
          deferred.resolve(eggs);
        }else{
          deferred.reject('Магазин закрыт');
        }

      }, 2000);

      $log.debug('o.go2Shop', deferred);
      return deferred.promise;
    }

    o.go2SGrandma = function(){
      var deferred = $q.defer();


      setTimeout(function(){
        deferred.notify('Я пошел к бабуле ' + new Date());
      }, 20);

      setTimeout(function(){
        deferred.notify('Я пришел к бабуле ' + new Date());

        var eggs = parseInt(Math.random()*10);

        if(eggs % 2){
          deferred.resolve(eggs);
        }else{
          deferred.reject('Бабуля уехала на дачу');
        }

      }, 4000);

      $log.debug('o.go2Shop', deferred);
      return deferred.promise;
    }

    return o;
  }

  TestsCtrl.$inject = ['$scope', '$rootScope', '$log', 'usersFactory', '$q', 'Son', 'fitfireService'];
  function TestsCtrl($scope, $rootScope, $log, currentProvider, $q, Son, fitfireService){
    var vm = this;
    $rootScope.curPath = 'tests';
    $rootScope.pageClass = 'page-tests';
    vm.title = 'Это тестовая страница';

    vm.toggle = true;

    $rootScope.needAuth = false;

    vm.sendSon = function(){

      var son1 = Son.go2Shop().then(
        function(data){// resolveHandler
          $log.debug('Молодец ' + data + '');
        },
        function(error){// rejectHandler
          $log.debug('Сходишь позже.', error);
        },
        function(msg){// notifyHandler
          $log.debug('Сын 1 сказал: ' + msg);
        }
      );

      var son2 = Son.go2SGrandma().then(
        function(data){// resolveHandler
          $log.debug('Делаю яичницу из ' + data + ' яиц');
        },
        function(error){// rejectHandler
          $log.debug('Нет яиц. Делай бутеры. ', error);
        },
        function(msg){// notifyHandler
          $log.debug('Сын 2 сказал: ' + msg);
        }
      );

      $q.all([son1, son2]).then(function(){
          $log.debug('Дети вернулись.');
      })

    }

    vm.images = [1,2,3,4,5,6,7,8];

    vm.loadMore = function(){
      var last = vm.images[vm.images.length - 1];
      var  i = 8;
      while(i--){
        vm.images.push(++last);
      }
    }

    vm.usersList = [];
    vm.loadMoreUsersWork = false;
    vm.userMoreLoadLimit = 5;
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

    vm.users = currentProvider.users;
    vm.combo_users_options = [];
    vm.users.map(function(line){
      vm.combo_users_options.push({id: line.$id, name: line.name});
    })

    vm.combo_pre = 'combo_1';

    vm.combo_users = {
      options: vm.combo_users_options,
      selected: vm.combo_users_options[0]
    }

    vm.combo_1 = {
      options: [
        {id: '0', name: 'All'}
        ,{id: '1', name: '111111111'}
        ,{id: '2', name: '2222222'}
        ,{id: '3', name: '33333333333333333'}
        ,{id: '4', name: '44444'}
        ,{id: '5', name: '5555555555555'}
        ,{id: '6', name: '6666666666'}
        ,{id: '7', name: '777777'}
        ,{id: '8', name: '8888888888888'}
        ,{id: '9', name: '99'}
      ],
      selected: {id: '7', name: '777777'}
    }

    vm.combo_2 = {
      options: [
        {id: '0', name: 'All'}
        ,{id: '1', name: '111111111'}
        ,{id: '2', name: '2222222'}
        ,{id: '3', name: '33333333333333333'}
        ,{id: '4', name: '44444'}
        ,{id: '5', name: '5555555555555'}
        ,{id: '6', name: '6666666666'}
        ,{id: '7', name: '777777'}
        ,{id: '8', name: '8888888888888'}
        ,{id: '9', name: '99'}
      ],
      selected: {id: '6', name: '6666666666'}
    }

    vm.combo_3 = {
      options: [
        {id: '0', name: 'All'}
        ,{id: '1', name: '111111111'}
        ,{id: '2', name: '2222222'}
        ,{id: '3', name: '33333333333333333'}
        ,{id: '4', name: '44444'}
        ,{id: '5', name: '5555555555555'}
        ,{id: '6', name: '6666666666'}
        ,{id: '7', name: '777777'}
        ,{id: '8', name: '8888888888888'}
        ,{id: '9', name: '99'}
      ],
      selected: {id: '4', name: '44444'}
    }

    $scope.$watch('vm.combo_1.selected', function(newVal, oldVal) {
      if(newVal !== oldVal){
        //$log.debug('vm.combo_1_selected', vm.combo_1.selected);
        vm.combo_2.selected = vm.combo_1.selected;
      }
    });

  }

  TestsConfig.$inject = ['$routeProvider'];
  function TestsConfig($routeProvider){
    $routeProvider
      .when('/tests', {
        templateUrl: '/app/components/tests/tests.html',
        controller: 'TestsCtrl',
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
