;(function(){
  'use strict';

  angular
    .module('ngFit.fitfire.service', ['firebase'])
    .service('fitfireService', fitfireService);

  fitfireService.$inject = ['$log','firebaseConfig', '$firebaseObject', '$firebaseArray', '$firebaseAuth', '$q'];
  function fitfireService($log, firebaseConfig, $firebaseObject, $firebaseArray, $firebaseAuth, $q){

    var self = this;

    if(!firebase.isInit){
      firebase.initializeApp(firebaseConfig);
      firebase.isInit = true;
    }

    var db = firebase.database();

    this.uploadFile = function(file, cb_progress, cb_done, cb_error){

      var storageRef = firebase.storage().ref();

      var metadata = {
        contentType: file.type?file.type:'image/jpeg'
      };

      var uploadTask = storageRef.child('images/' + file.name).put(file, metadata);

      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        function(snapshot) {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          $log.debug('Upload is ' + progress + '% done');
          if(cb_progress) cb_progress(progress);
          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
              $log.debug('Upload is paused');
              break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
              $log.debug('Upload is running');
              break;
          }
        },
        function(error) {
          switch (error.code) {
            case 'storage/unauthorized':
              $log.debug('Error storage/unauthorized');
              // User doesn't have permission to access the object
              break;

            case 'storage/canceled':
              $log.debug('Error storage/canceled');
              // User canceled the upload
              break;

            case 'storage/unknown':
              $log.debug('Error storage/unknown');
              // Unknown error occurred, inspect error.serverResponse
              break;
          }
          if(cb_error) cb_error(error);
        }, function() {
          // Upload completed successfully, now we can get the download URL
          var downloadURL = uploadTask.snapshot.downloadURL;
          //$log.debug('uploadTask.snapshot', uploadTask.snapshot);
          $log.debug('Upload complete. Url = ' + downloadURL);
          if(cb_done) cb_done(downloadURL);
        });

    }

    this.addUser = function(user, anonim, cb){
      var userLength = $firebaseObject(db.ref('options/userLength'));
      return userLength.$loaded(function() {
        var newLength = ++userLength.$value;
        userLength.$save();
        var users = db.ref('users');
        if(anonim) user.name = anonim + ' ' + newLength;
        //$log.debug(anonim);
        //$log.debug(user);
        users.child(newLength).set(user);
        if(cb) cb(user.name);
      });
    }

    this.updateUser = function(_user){
      var user = db.ref('users/' + _user.$id);
      user.set({
        name: _user.name,
        age: _user.age,
        uid: _user.uid,
        owner:_user.owner
      });
      return $firebaseArray(user).$loaded();
    }

    this.deleteUser = function(_user){
      var user = db.ref('users/' + _user.$id);
      user.remove();
      return $firebaseArray(user).$loaded();
    }

    this.getUsers = function(){
      var users = $firebaseArray(db.ref('users'));
      return users.$loaded();
    }

    this.getJSONData = function(_st, _len){
      var json_data = $firebaseArray(
        db.ref('jsondata')
          .orderByKey()
          .startAt(_st)
          .limitToFirst(_len)
      );
      return json_data.$loaded();
    }

    /*this.getUsers = function(cb){
      var deferred = $q.defer();

      var users = $firebaseArray(self.ref.child('users'));

      users.$loaded()
        .then(function(data){
          $log.debug('resolve');
          deferred.resolve(data);
        })
        .catch(function(error){
          $log.debug('reject');
          deferred.reject(error);
        })

      return deferred.promise;
    }*/

  }
})();
