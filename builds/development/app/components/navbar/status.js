;(function(){
  'use strict';

  angular.module('ngFit.status', ['ngRoute', 'ngFit.logged-user', 'ngFit.auth.firebase', 'ngFit.fitfire.service'])
    .controller('AuthCtrl', AuthController);

  AuthController.$inject = ['$rootScope', '$scope', '$log', 'Auth', 'fitfireService', '$location'];
  function AuthController($rootScope, $scope, $log, Auth, fitfireService, $location){
    var vm = this;

    vm.credential = null;
    vm.newUser = null;
    vm.error = '';

    vm.userName = '';
    vm.userPhoto = '';
    vm.userData = null;
    vm.isNewUser = false;
    vm.isAnonymously = false;
    vm.uploadProgress = 0;

    vm.init = function(){
      Auth.getCurrentUser(function(user){
        $log.debug('status.js Auth.getCurrentUser');
        vm.updateUserData(user);
        //vm.resetLoginForm();
        //$('#sign-in-modal').modal('hide');
        $scope.$apply();
      });
    }

    vm.init();

    vm.updateUserData = function(user){
      vm.userData = {};
      if($rootScope.currentUser){
        vm.userData.isAnonymous = $rootScope.currentUser.isAnonymous;
        if($rootScope.currentUser.isAnonymous){
          vm.userData.userName = vm.userData.FullName = $rootScope.currentUser.displayName?$rootScope.currentUser.displayName:'Anonymous User';
        }
        else{
          vm.userData.userName = vm.userData.FullName = $rootScope.currentUser.displayName?$rootScope.currentUser.displayName:$rootScope.currentUser.email;
        }
        vm.userData.userPhoto = $rootScope.currentUser.photoURL;
        vm.userData.email = $rootScope.currentUser.email;

      }else{
        vm.userData = null;
      }
      $log.debug(vm.userData);
    }

    vm.searchStr = function(){
      //$log.debug(vm.search);
      $rootScope.search = vm.search;
    }

    vm.updateScope = function(cb){
      //$log.debug('!!!!!!!!!!!!!!!!!!!!!!!!!');
      vm.updateUserData();
      $scope.$apply();
    }

    vm.signInAnonymously = function(){
      Auth.signInAnonymously(function(user, error){
        vm.updateUserData(user);
        if(user){
          vm.init();
          vm.resetLoginForm();
          $scope.$apply();
          //addUser(null, 0, user.uid, 'Anonymous User');
          $log.debug('status.js vm.signInAnonymously = '+ user);
        }else if(error){
          $log.debug(error);
          //$scope.$apply();
        }
      });
    }

    vm.loginExist = function(){
      vm.error = '';
      Auth.login(vm.credential.email, vm.credential.password, function(user, error){
        vm.updateUserData(user);
        if(user){
          $log.debug('status.js vm.loginExist = ' + user);
          vm.init();
          vm.resetLoginForm();
          $scope.$apply();
        }
        if(error){
          $log.debug(error);
          vm.error = error.message;
          //$scope.$apply();
        }
      }).then(function(){});
    }

    vm.createNewUser = function(){
      vm.error = '';
      var _name = vm.newUser.name;
      var _age = vm.newUser.age;
      Auth.createNewUser(vm.credential.email, vm.credential.password, function(user, error){
        if(user){
          $log.debug('user', user);
          var _uid = user.uid;
          if(vm.fileName){
            $log.debug('vm.fileName', vm.fileName);
            fitfireService.uploadFile(
              vm.files[0],
              function(progress){//progress
                vm.uploadProgress = progress;
                $scope.$apply();
                $log.debug('progress', progress);
              },function(url){//done
                vm.uploadProgress = 100;
                vm.fileName = url;
                $scope.$apply();
                $log.debug('url', url);
                Auth.updateProfile(_name, vm.fileName, function(user, error){
                  if(user){
                    //$log.debug(user);
                    addUser(_name, _age, _uid);
                  }else if(error){
                    $log.debug('vm.createNewUser updateProfile erorr');
                    vm.error = error;
                  }
                });
              }, function(error){ //error
                $log.debug(error);
              });
          }else{
            addUser(_name, _age, _uid);
          }
        }else if(error){
          $log.debug(error);
          vm.error = error.message;
          $scope.$apply();
        }
      }).then(function(){});
    }

    vm.getProgress = function(){
      return vm.uploadProgress + '%';
    }

    function addUser(name, age, uid, anonim){
      //$log.debug('Step 4');
      //$log.debug('addUser(); name=' + name + '; age=' + age + '; uid=' + uid);
      if(anonim){
        fitfireService.addUser({id: null, name: name, age: age, uid: uid, owner: 'null'}, anonim, function(name){
          if(name){
            Auth.updateProfile(name, null, function(user, error){
              if(user){
                //vm.updateUserData(user);
                //$scope.$apply();
                vm.init();
                vm.resetLoginForm();
                $scope.$apply();
                $log.debug(user);
              }else if(error){
                vm.error = error;
              }
            });
          }
        });
      }else{
        fitfireService.addUser({id: null, name: name, age: age, uid: uid, owner: 'null'}, null, function(user){
          vm.init();
          vm.resetLoginForm();
          $scope.$apply();
        });
      }

      //$log.debug('status.js vm.createNewUser = ' + user);
      //vm.updateUserData();
      //$scope.$apply();
    }

    vm.logout = function(){
      Auth.logout(function(user, error){
        vm.updateUserData(user);
        if($rootScope.curPath !== 'home'){
          $location.path('/#');
        }
        $log.debug('status.js Logout ' + user);
        $scope.$apply();
      }).then(function(){});
    }

    vm.setMod = function(key){
      if(key == 1){
        vm.isNewUser = !vm.isNewUser?false:true;
        vm.isAnonymously = false;
      }else if(key == 2){
        vm.isNewUser = false;
        vm.isAnonymously = !vm.isAnonymously?false:true;
      }else{
        vm.isNewUser = false;
        vm.isAnonymously = false;
      }
    }

    vm.resetNewUserParams = function(){
      vm.newUser = {name: null, age: 18, photo: null};
      $('#inputLogin, #inputPassword').attr('class', 'form-control');
    }

    vm.resetLoginForm = function(val){
      vm.credential = {
        email: null,
        password: null
      };
      vm.error = '';
      vm.isNewUser = false;
      vm.isAnonymously = false;
      //$('#inputName, #inputAge').attr('class', 'form-control');
      //$('#loginForm').attr('class', 'form-horizontal');
      vm.resetNewUserParams();
      $('#sign-in-modal').modal('hide');
    }

    vm.isChanged = false;
    vm.fileName = null;
    vm.files = null;

    vm.uploadFileChange = function(files){
      $log.debug(files);
      if(files.length){
        var str = '';
        for(var i= 0; i < files.length; i++){
          if(i > 0) str += ', ';
          str += files[i].name;
        }
        vm.fileName = str;
        vm.isChanged = files.length?true:false;
        vm.files = files.length?files:null;
      }else{
        vm.fileName = null;
        vm.files = null;
        $log.debug('Empty');
      }


    }

    vm.uploadFile = function(){
      fitfireService.uploadFile(vm.files[0]);
    }

    vm.resetLoginForm();

  }

})();