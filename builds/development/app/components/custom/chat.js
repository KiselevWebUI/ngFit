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
    vm.forDeleteMessages = {};
    vm.deleteMessagesCount = 0;

    vm.forEditMessages = null;

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
        });
      }).catch(function(err){
        $scope.$apply(function(){
          vm.save_error = err.msg;
        })
        $log.debug(err);
      });

    chatService.getLastUpdatedMessage()
      .then(function(data){
        vm.lastUpdatedMessage = data;
      })


    vm.setCurrentChat = function(user){
      vm.currentChatUser = user;
      //console.log('vm.currentChatUser', vm.currentChatUser);
      chatService.getChats()
        .then(function(data){
          //vm.currentChat = data;
          vm.currentChat = $filter('userInChat')(data, parseInt(user.$id), $rootScope.currentUser.$id);
          //console.log(data, vm.currentChat);
          if(vm.currentChat[0] && vm.currentChat[0].$id){
            chatService.getMessagesForCurrentChat(parseInt(vm.currentChat[0].$id))
              .then(function(data){
                vm.currentChatMessages = data;
                vm.chatMessage = getEmptyMessaage(parseInt(vm.currentChat[0].$id), $rootScope.currentUser.$id, parseInt(user.$id));
                //console.log('vm.currentChatMessages', vm.currentChatMessages);
                //console.log('vm.chatMessage', vm.chatMessage);
                chatService.resetUnreadedMessages(user.$id, $rootScope.currentUser.$id, function(){

                });
                scrollToBottom();
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
              chatService.getChats()
              .then(function(data){
                  vm.currentChat = $filter('userInChat')(data, parseInt(user.$id), $rootScope.currentUser.$id);
                  //console.log(data, vm.currentChat);
                  vm.chatMessage = getEmptyMessaage(parseInt(id), $rootScope.currentUser.$id, parseInt(user.$id));
                  scrollToBottom();
              });
            });
          }
        }).catch(function(err){
          $scope.$apply(function(){
            vm.save_error = err.msg;
          })
          $log.debug(err);
        });
    }

    vm.delMessage = function($event, message){
      $event.preventDefault();
      $event.stopPropagation();
      if(!vm.forDeleteMessages[message.$id]){
        vm.forDeleteMessages[message.$id] = message;
        vm.deleteMessagesCount++;
        if(vm.forEditMessages[message.$id]){
          vm.forEditMessages = null;
          vm.chatMessage = null;
        }
      }else{
        delete vm.forDeleteMessages[message.$id];
        vm.deleteMessagesCount--;
      }
      //console.log('vm.delMessage', message, vm.forDeleteMessages);
    }

    vm.deleteMessages = function(){
      chatService.deleteMessages(vm.forDeleteMessages)
        .then(function(data){
          //console.log('data', data);
          $scope.$apply(function(){
            vm.forDeleteMessages = {};
            vm.deleteMessagesCount = 0;
          })
          //console.log('vm.deleteMessagesCount', vm.deleteMessagesCount);
        })
        .catch(function(err){
          $scope.$apply(function(){
            vm.save_error = err.msg;
          })
          $log.debug(err);
        });
    }

    vm.editMessage = function($event, message, possible){
      if(possible){
        vm.chatMessage = message;
        vm.forEditMessages = message;
        //console.log('vm.editMessage', message);
        if(vm.forDeleteMessages[message.$id]){
          delete vm.forDeleteMessages[message.$id];
          vm.deleteMessagesCount--;
        }
      }
      else{
        vm.chatMessage = null;
        vm.forEditMessages = null;
      }
    }

    vm.saveMessage = function(){
      chatService.saveMessage(vm.forEditMessages, vm.chatMessage, function(message){
        vm.chatMessage = null;
        vm.forEditMessages = null;
      })
      .then(function(){
      })
      .catch(function(err){
        $scope.$apply(function(){
          vm.save_error = err.msg;
        })
        $log.debug(err);
      });
    }

    vm.sendMessage = function(){
      //console.log(vm.chatMessage);
      chatService.addMessage(vm.chatMessage, function(message, id){
        //console.log('vm.sendMessage', message, id)
        vm.chatMessage.text = '';
        chatService.updateUser(message.from, message.to)
        .then(function(user){
            if(!vm.currentChatMessages.length){
              chatService.getMessagesForCurrentChat(parseInt(vm.currentChat[0].$id))
                .then(function(data){
                  vm.currentChatMessages = data;
                  //console.log('vm.currentChatMessages', vm.currentChatMessages);
                  scrollToBottom();
                }).catch(function(err){
                  $scope.$apply(function(){
                    vm.save_error = err.msg;
                  })
                  $log.debug(err);
                });
            }else  scrollToBottom();
          });
      })
    }

    function scrollToBottom(){
      setTimeout(function(){$('#chat-body-container').animate({scrollTop: 100000}, 1000);}, 100);
      //alert('scrollToBottom')
    }

    chatService.addWatchToLastUpdatedMessageObject().$watch(function(data){
      $rootScope.$broadcast('ListMessageChanged');
    });

    $scope.$on('ListMessageChanged', function() {
      //console.log('$on ListMessageChanged:', vm.lastUpdatedMessage);
      if(vm.currentChat && vm.currentChatMessages){
        var id = vm.lastUpdatedMessage.id;
        var from = vm.lastUpdatedMessage.from;
        var to = vm.lastUpdatedMessage.to;
        //console.log('id', id, 'from', from, 'to', to);
        $('#chat-body-container').find('.chat-message').removeClass('lastMessage');
        if(to == $rootScope.currentUser.$id){
          chatService.resetUnreadedMessages(from, $rootScope.currentUser.$id, function(){
            setTimeout(function(){
              $('#chat-body-container').find('.chat-message').removeClass('lastMessage');
              $('#chat-body-container').find('.chat-message:last').addClass('lastMessage');
              setTimeout(function(){
                $('#chat-body-container').find('.chat-message:last').removeClass('lastMessage');
              }, 15000);
              scrollToElement('#chat-message-' + id);
            }, 100);
          });
        }
      }
    });

    function scrollToElement(element) {
      if($(element) && $(element).offset()){
        var top = $(element).offset().top + $('#chat-body-container').prop('scrollHeight');
        //alert(top);
        $('#chat-body-container').animate({
          scrollTop: top
        });
      }
    }

    vm.notMsg = function(user){
      var returnValue = true;
      if($rootScope.currentUser && $rootScope.currentUser.$id && user.msg){
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
      vm.deleteMessages = {};
      vm.deleteMessagesCount = 0;
    }
  }

})();