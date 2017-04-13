;(function(){
  'use strict';

  angular.module('ngFit.chat', ['ngFit.chat.service'])
    .directive('chatBlock', function(){
      return {
        restrict: 'E',
        scope: true,
        templateUrl: '/app/components/custom/chat.html',
        controller: chatCtrl,
        controllerAs: 'vm',
        bindToController: true,
        link: function($scope, element, attrs, ctrls){}
      }
    })
    .filter('loggedtUser', loggedtUserFilter)
    .filter('userInChat', userInChatFilter)

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

  function userInChatFilter(){
    return function(input, firstId, secondId) {
      var array = [];
      if(input){
        input.forEach(function(item){
          if((item.from === firstId && item.to === secondId) || (item.from === secondId && item.to === firstId)) array.push(item);
        })
        return array;
      }
    };
  }

  chatCtrl.$inject = ['$rootScope', '$scope', '$element', '$log', 'chatService', '$filter', '$timeout'];
  function chatCtrl($rootScope, $scope, $element, $log, chatService, $filter, $timeout){
    var vm = this;

    vm.logedUsers = null;
    vm.save_error = null;

    vm.currentChat = null;
    vm.currentChatUser = null;
    vm.currentChatMessages = null;

    function getEmptyChat(from, to){
      return {
        from: from?from:null,
        to:   to?to:null
      };
    }

    function getEmptyMessaage(chat, from, to, text){
      return {
        chat: chat?chat:null,
        from: from?from:null,
        to:   to?to:null,
        text: text?text:''
      };
    }

    chatService.getLogedUsers()
      .then(function(data){
        vm.logedUsers = data;
        vm.logedUsers.map(function(user){
          if(user.uid === $rootScope.currentUser.uid){
            $rootScope.currentUser.$id = parseInt(user.$id);
          }
        })
      }).catch(function(err){
        $scope.$apply(function(){
          vm.save_error = err.msg;
        })
        $log.debug(err);
      });


    vm.setCurrentChat = function(user){
      vm.currentChatUser = user;
      chatService.getChats()
        .then(function(data){
          vm.currentChat = data;
          vm.currentChat = $filter('userInChat')(data, parseInt(user.$id), $rootScope.currentUser.$id);
          if(vm.currentChat[0] && vm.currentChat[0].$id){
            chatService.getMessagesForCurrentChat(parseInt(vm.currentChat[0].$id))
              .then(function(data){
                vm.currentChatMessages = data;
                vm.chatMessage = getEmptyMessaage(parseInt(vm.currentChat[0].$id), $rootScope.currentUser.$id, parseInt(user.$id));
                chatService.resetUnreadedMessages(user.$id, $rootScope.currentUser.$id, function(){

                });
                setTimeout(function(){$('#chat-body-container').animate({scrollTop: 100000}, 1000);}, 100);
              }).catch(function(err){
                $scope.$apply(function(){
                  vm.save_error = err.msg;
                })
                $log.debug(err);
              });
          }else{
            vm.currentChatMessages = [];
            var newChat = getEmptyChat($rootScope.currentUser.$id, parseInt(user.$id));
            chatService.addNewChat(newChat, function(chat, id){
              vm.chatMessage = getEmptyMessaage(parseInt(id), $rootScope.currentUser.$id, parseInt(user.$id));
              setTimeout(function(){$('#chat-body-container').animate({scrollTop: 100000}, 1000);}, 100);
            });
          }
        }).catch(function(err){
          $scope.$apply(function(){
            vm.save_error = err.msg;
          })
          $log.debug(err);
        });
    }

    vm.sendMessage = function(){
      chatService.addMessage(vm.chatMessage, function(message, id){
        vm.chatMessage.text = '';
        chatService.updateUser(message.from, message.to)
        .then(function(user){
            setTimeout(function(){$('#chat-body-container').animate({scrollTop: 100000}, 1000);}, 100);
        });
      })
    }

    vm.notMsg = function(user){
      var returnValue = true;
      if(user.msg){
        for(var i in user.msg){
          if(($rootScope.currentUser.$id == parseInt(user.msg[i].to)) && (user.msg[i].count != 0)){
            returnValue = false;
            break;
          }
        }
      }
      return returnValue;
    }

    vm.userSelf = function(user){
      if(user && $rootScope.currentUser){
        return user.uid === $rootScope.currentUser.uid;
      }else return false;
    }

    vm.resetChatPopup = function(){
      vm.currentChat = null;
      vm.currentChatUser = null;
      vm.currentChatMessages = null;
    }
  }

})();