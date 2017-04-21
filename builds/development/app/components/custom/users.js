;(function(){
  'use strict';

  angular.module('ngFit.users', ['ngFit.fitfire.service', 'infinite-scroll', 'ngFit.chat'])
    .directive('usersBlock', function(){
      return {
        restrict: 'E',
        scope: true,
        templateUrl: '/app/components/custom/users.html',
        controller: usersListCtrl,
        controllerAs: 'vm',
        bindToController: true,
        link: function($scope, element, attrs, ctrls){}
      }
    })
  .filter('anonim', anonimFilter)
  .filter('withBalance', withBalanceFilter)
  .filter('forCurrentUser', forCurrentUserFilter)
  .filter('loggedtUser', loggedtUserFilter)
  .filter('offset', offsetFilter)

  function loggedtUserFilter(){
    return function(input, $rootScope) {
      var array = [];
      if(input){
        input.forEach(function(item){
          if(item.logedNow) array.push(item);
        })
        return array;
      }
    };
  }

  function forCurrentUserFilter(){
    return function(input, $rootScope) {
      var array = [];
      if(input){
        input.forEach(function(item){
          //console.log(item);
          if($rootScope.currentUser && ($rootScope.currentUser.uid === item.uid || $rootScope.currentUser.uid === item.owner)) array.push(item);
        })
        return array;
      }
    };
  }

  function offsetFilter(){
    return function(input, start) {
      start = parseInt(start, 10);
      if (!input || !input.length) { return; }
      return input.slice(start);
    };
  }

  function withBalanceFilter(){
    return function(array, min, max){
      //console.log(min, max);
      return array;
    };
  }

  function anonimFilter(){
    return function(val){
      //console.log('Anonim');
      return val > 0?'':' (Anonim)';
    }
  }

  usersListCtrl.$inject = ['$rootScope', '$scope', '$element', '$log', 'fitfireService', 'firebaseConfig', '$filter', '$timeout'];
  function usersListCtrl($rootScope, $scope, $element, $log, currentProvider, firebaseConfig, $filter, $timeout){
    var vm = this;

    vm.userProvider = '"fitfireService"';

    /*var customViewType = $($element).attr('view-type');
    vm.userViewType = customViewType && customViewType.length?customViewType:'"Include"';*/

    var editType = $($element).attr('edit');
    vm.editType = editType?true:false;

    vm.userForm = false;

    vm.dbUrl = firebaseConfig.databaseURL;




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
      currentProvider.getJSONData(vm.userMoreLoadStart, vm.userMoreLoadLimit).then(function(data){
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

    vm.flexBodyScroll = function($event){
      console.log($event)
    }


    vm.user = {};
    vm.users = null;
    vm.logedUsers = null;
    vm.filtredUsers = null;
    vm.likeCurrentUsers = null;

    vm.sortTo = false;
    vm.sortBy = '$id';

    vm.currentPage = 0;
    vm.itemsPerPage = 5;
    vm.itemsPerPageArray = [5, 10, 15, 20, 'All'];
    vm.isCurrentUser = false;

    vm.setCurrentPage = function(page){
      vm.currentPage = page;
    }

    vm.sortByColumn = function(name){
      vm.sortBy = name;
      vm.sortTo = !vm.sortTo;
    }

    currentProvider.getUsers()
      .then(function(data){
        vm.users = data;
        vm.users.forEach(function(item){
          item.$id = parseInt(item.$id);
        });
        //vm.getFiltredUsers();
      }).catch(function(err){
        $log.debug(err);
      });

    /*currentProvider.getUsers(function(data){
      vm.users = data;
      $log.debug(data);
      vm.totalPages = data.length;
      var pagesCount = Math.ceil(vm.totalPages / vm.itemsPerPage);
      $log.debug(pagesCount)
      vm.allPages = [];
      for (var i = 0; i < pagesCount; i++) {
        vm.allPages.push(i);
      }
      $log.debug(vm.allPages)
    });*/

    vm.getLogedUsers = function(){
      vm.logedUsers = $filter('loggedtUser')(vm.users);
    }

    vm.setItemsPerPage = function(item){
      vm.itemsPerPage = item;
      vm.getFiltredUsers();
    }

    vm.getFiltredUsers = function(val){
      val = $rootScope.search?$rootScope.search:'';
      $log.debug(val);
      vm.filtredUsers = [];
      vm.currentPage = 0;
      //vm.itemsPerPage = 5;
      if(vm.users){
        vm.users.forEach(function(item){
          if(val && val.length){
            if(item.name.indexOf(val) > -1){
              if($rootScope.currentUser && vm.isCurrentUser){
                if($rootScope.currentUser.uid === item.uid || $rootScope.currentUser.uid === item.owner){
                  vm.filtredUsers.push(item);
                }
              }else{
                vm.filtredUsers.push(item);
              }
            }
          }else{
            if($rootScope.currentUser && vm.isCurrentUser){
              if($rootScope.currentUser.uid === item.uid || $rootScope.currentUser.uid === item.owner){
                vm.filtredUsers.push(item);
              }
            }else{
              vm.filtredUsers.push(item);
            }
          }
        });
      }
    }

    $rootScope.$watch('search', function(newVal, oldVal) {
      if(newVal != oldVal && vm.itemsPerPage != vm.itemsPerPageArray[vm.itemsPerPageArray.length-1]){
        vm.itemsPerPage = vm.itemsPerPageArray[vm.itemsPerPageArray.length-1];
        //$log.debug(vm.itemsPerPage, vm.itemsPerPageArray[vm.itemsPerPageArray.length-1]);
      }
      vm.getFiltredUsers(newVal);
      //$log.debug(newVal, oldVal);
    });

    $scope.$watch('vm.users', function(newVal) {
      if(newVal){
        vm.getFiltredUsers();
        vm.likeCurrentUsers = $filter('forCurrentUser')(vm.users, $rootScope);
        vm.getLogedUsers();
      }
      $log.debug('vm.users', newVal);
    });

    $scope.$on('ListObjectChanged', function() {
      //console.log('users.js ListObjectChanged: getLogedUsers()');
      vm.getLogedUsers();
    });

    $rootScope.$watch('currentUser', function(newVal) {
      vm.getFiltredUsers();
      $log.debug('$rootScope.currentUser', newVal);
    });

    $scope.$watch('vm.filtredUsers', function(newVal) {
      vm.likeCurrentUsers = $filter('forCurrentUser')(vm.users, $rootScope);
      $log.debug('vm.filtredUsers');
    });

    vm.canCreateNew = function(){
      return $rootScope.currentUser && !$rootScope.currentUser.isAnonymous && vm.editType;
    }

    vm.openCloseUserForm = function(key, reset){
      if(reset) vm.defaultUser();
      vm.userForm = key?true:false;
    }

    vm.defaultUser = function(name, age){
      vm.user = {
        id: null,
        name: null,
        age: 0,
        uid: 'null',
        owner: 'null',
        msg: 0,
        logedNow: false
      }
    }

    vm.addUser = function(){
      vm.user.owner = $rootScope.currentUser.uid;
      currentProvider.addUser(vm.user).then(function(){
        vm.openCloseUserForm(0, 1);
        vm.getFiltredUsers();
      });
    }

    vm.updateUser = function(){
      currentProvider.updateUser(vm.user).then(function(){
        vm.openCloseUserForm(0, 1);
        vm.getFiltredUsers();
      });
    }

    vm.deleteUser = function(user){
      if(user) vm.user = user;
      currentProvider.deleteUser(vm.user).then(function(){
        vm.openCloseUserForm(0, 1);
        vm.getFiltredUsers();
      });
    }

    vm.setEdit = function(user){
      //if(!vm.editType || $rootScope.currentUser.isAnonymous) return;
      //$log.debug(!vm.isEditable(user), !vm.editType);
      if(!vm.isEditable(user) || !vm.editType){
        vm.openCloseUserForm(0, 1);
        return;
      }
      vm.user = user;
      vm.openCloseUserForm(1);
    }

    vm.isEditable = function(user){
      if(user && $rootScope.currentUser) return (user.owner === $rootScope.currentUser.uid) && vm.editType;
      else return false;
    }

    vm.userSelf = function(user){
      if(user && $rootScope.currentUser) return user.uid === $rootScope.currentUser.uid;
      else return false;
    }

    vm.defaultUser();
  }

})();