;(function(){
  'use strict';

  angular.module('ngFit.logged-user', ['ngFit.auth.firebase'])
    .directive('loggedUser', loggedUser)

  function loggedUser(){
    return {
      restrict: 'E',
      scope: {data: '=data', handler: '&'},
      controller: loggedCtrl,
      controllerAs: 'lu',
      bindToController: true,
      templateUrl: '/app/components/custom/logged-user.html'
    }
  }

  loggedCtrl.$inject = ['$rootScope', '$scope', '$log', 'fitfireService', 'Auth'];
  function loggedCtrl($rootScope, $scope, $log, fitfireService, Auth){
    var vm = this;

    vm.allUsers = null;
    //vm.isChanged = false;
    vm.needUpload = false;
    //vm.afterUpload = false;
    //vm.notemptyFile = false;
    vm.fileName = null;
    vm.files = null;
    //vm.upload_error = null;
    vm.save_error = null;
    vm.isEditDisplayName = false;
    vm.uploadProgress = 0;

    vm.anonymous = {
      email: null,
      password: null
    };

    vm.resetPopup = function(){
      vm.isChanged = false;
      vm.resetUpload();
      //$log.debug("resetPopup");
    }

    vm.uploadPopup = function(){
      vm.needUpload = !vm.needUpload;
      if(!vm.needUpload){
        vm.resetUpload();
      }
    }

    vm.resetUpload = function(){
      vm.fileName = null;
      vm.isChanged = false;
      //vm.notemptyFile = false;
      vm.needUpload = false;
      vm.isEditDisplayName = false;
      vm.uploadProgress = 0;
    }

    vm.senMailToVerified = function(){
      $('#logged-user-modal').modal('hide');
    }

    vm.convertAnonymous = function(){
      Auth.convertAnonymous(vm.anonymous.email, vm.anonymous.password, function(user, error){
        if(user){
          console.log("vm.convertAnonymous Anonymous account successfully upgraded", user);
          addUser(null, 0, user.uid, 'Anonymous User');
          $('#logged-user-modal').modal('hide');
        }
        if(error){
          console.log("vm.convertAnonymous Error upgrading anonymous account", error);
          vm.save_error = error;
        }
      });
    }

    function addUser(name, age, uid, anonim){
      fitfireService.addUser({id: null, name: name, age: age, uid: uid, owner: 'null'}, anonim, function(name){
        if(name){
          Auth.updateProfile(name, null, function(user, error){
            if(user){
              vm.handler();
              //$log.debug(user);
            }else if(error){
              vm.save_error = error;
            }
          });
        }
      });
    }

    vm.save = function(){
      if(vm.fileName){
        vm.uploadFile();
      }else{
        vm.saveChanges();
      }
    }

    vm.saveChanges = function(){
      //$log.debug('vm.data.displayName = ' + vm.data.userName);
      Auth.updateProfile(vm.data.userName, vm.fileName, function(user, error){
        if(user){
          getUsersFromUID(user.uid, user.displayName, user.photoURL);
          vm.resetUpload();
          $('#logged-user-modal').modal('hide');
          $scope.$apply();
          vm.handler();
        }else if(error){
          vm.save_error = error;
        }
      })
    }

    function getUsersFromUID(uid, displayName, photoURL){
      fitfireService.getUsers().then(function(data){
        vm.allUsers = data;
        $log.debug('logged-user.js');
        $log.debug(vm.allUsers.length);
        var curr = null;
        for(var i = 0; i < vm.allUsers.length; i++){
          var user = vm.allUsers[i];
          $log.debug(vm.allUsers[i]);
          $log.debug(vm.allUsers[i].uid + ' === ' + uid + '    ' + (vm.allUsers[i].uid === uid));
          if(vm.allUsers[i].uid === uid){
            vm.allUsers[i].name = displayName;
            curr = vm.allUsers[i];
            break;
          }
        }
        $log.debug(curr);
        if(curr){
          fitfireService.updateUser(curr).then(function(user){
            $log.debug(user);
          });
        }
      }).catch(function(err){
        vm.allUsers = null;
        $log.debug(err);
      });
    }

    vm.editDisplayName = function(){
      vm.isEditDisplayName = !vm.isEditDisplayName;
    }

    vm.uploadFileChange = function(files){
      $log.debug('vm.uploadFileChange',files);
      if(files.length){
        var str = '';
        for(var i= 0; i < files.length; i++){
          if(i > 0) str += ', ';
          str += files[i].name;
        }
        vm.fileName = str;
        //if(files.initType == '2') vm.notemptyFile = files.length?true:false;
        vm.files = files.length?files:null;
        vm.isChanged = files.length?true:false;
        //$log.debug(vm.files);
      }else{
        vm.fileName = null;
        $log.debug('Empty');
      }
    }

    vm.uploadFile = function(){
      //$log.debug('vm.uploadFile' + vm.files[0]);
      fitfireService.uploadFile(
        vm.files[0],
        function(progress){//progress
          vm.uploadProgress = progress;
          $scope.$apply();
        },function(url){//done
          vm.uploadProgress = 100;
          vm.fileName = url;
          //vm.isChanged = true;
          $scope.$apply();
          //vm.afterUpload = true;
          //$scope.$apply();
          vm.saveChanges();
        }, function(error){ //error
          $log.debug(error);
        }
      );
    }

    /*vm.getProgress = function(){
     return vm.uploadProgress + '%';
     }*/

  }

})();