;(function(){
  'use strict';

  angular
    .module('ngFit.chat.service', ['firebase'])
    .service('chatService', chatService);

  chatService.$inject = ['$log', 'firebaseConfig', '$firebaseObject', '$firebaseArray'];
  function chatService($log, firebaseConfig, $firebaseObject, $firebaseArray){

    var self = this;

    if(!firebase.isInit){
      firebase.initializeApp(firebaseConfig);
      firebase.isInit = true;
    }

    var db = firebase.database();

    this.addNewChat = function(chat){
      var chatLength = $firebaseObject(db.ref('options/chatLength'));
      return chatLength.$loaded(function() {
        var newLength = ++chatLength.$value;
        chatLength.$save();
        var chats = db.ref('chats');
        chats.child(newLength).set(chat);
        if(cb) cb(chat, newLength);
      });
    }

    this.getChats = function(){
      var chat = db.ref('chats');
      return $firebaseArray(chat).$loaded();
    }

    this.addMessage = function(message, cb){
      var messagesLength = $firebaseObject(db.ref('options/messagesLength'));
      return messagesLength.$loaded(function() {
        var newLength = ++messagesLength.$value;
        messagesLength.$save();
        var messages = db.ref('messages');
        messages.child(newLength).set(message);
        if(cb) cb(message, newLength);
      });
    }

    this.getMessage = function(message){
      return $firebaseObject(db.ref('messages/' + message.$id)).$loaded();
    }

    this.saveMessage = function(message){
      var message = db.ref('messages/' + message.$id);
      message.$save();
      return $firebaseObject(message).$loaded();
    }

    this.deleteMessage = function(message){
      var message = db.ref('messages/' + message.$id);
      message.$remove();
      return $firebaseObject(message).$loaded();
    }

    this.addWatchToMessagesListObject = function(){
      return $firebaseObject(db.ref('messages'));
    }

    this.getMessages = function(){
      return $firebaseArray(db.ref('messages')).$loaded();
    }

    this.getMessagesForCurrentChat = function(chat){
      var messages = db.ref('messages').orderByChild('chat').equalTo(chat);
      return $firebaseArray(messages).$loaded();
    }

    this.getLogedUsers = function(){
      var users = db.ref('users').orderByChild('logedNow').equalTo(true);
      return $firebaseArray(users).$loaded();
    }

    this.updateUser = function(from, to, cb){
      var user = db.ref('users/' + from);
      return $firebaseObject(user).$loaded(function(user_){
        var count = 1;
        if(user_.msg && 'number' != typeof(user_.msg)){
          if(user_.msg['' + to]){
            count = parseInt(user_.msg['' + to].count) + 1;
          }
        }else user_.msg = {};
        user_.msg['' + to] = {to: '' + to, count: count};
        user_.$save();
        if(cb) cb(user_);
      });
    }

    this.resetUnreadedMessages = function(id, myId, cb){
      var user = db.ref('users/' + id);
      return $firebaseObject(user).$loaded(function(user_){
        user_.msg['' + myId].count = 0;
        user_.$save();
        if(cb) cb(user_);
      });
    }

  }
})();
