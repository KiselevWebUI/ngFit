;(function(){
  'use strict';

  angular
    .module('ngFit', ['ngRoute', 'ngCookies', 'ngFit.users', 'ngFit.custom', 'ngFit.main', 'ngFit.about', 'ngFit.contact', 'ngFit.tests', 'ngFit.status'])
    .constant('FIREBASE_URL', 'https://fir-c37b2.firebaseio.com/')
    .constant('firebaseConfig', {
      apiKey: "AIzaSyD8YQAsri-BBb9wKiRlaELtdWzAoKM7G44",
      authDomain: "fir-c37b2.firebaseapp.com",
      databaseURL: "https://fir-c37b2.firebaseio.com",
      storageBucket: "fir-c37b2.appspot.com",
      messagingSenderId: "310459817469"
    })
    .config(Config)
    .run(Run)

  Config.$inject = ['$routeProvider', '$locationProvider', '$logProvider'];
  /* @ngInject */
  function Config($routeProvider, $locationProvider, $logProvider){
    //console.log('Config');
    $routeProvider
      .otherwise({redirectTo: '/'});

    $locationProvider.html5Mode(false);
    $logProvider.debugEnabled(true);
  }

  Run.$inject = ['fitfireService'];
  function Run(fitfireService){
    //console.log('Run')
  }

})();

;(function(){
  'use strict';

  angular.module('ngFit.auth.firebase', ['firebase'])
    .factory('Auth', AuthenticationFactory)

  AuthenticationFactory.$inject = ['$rootScope', 'firebaseConfig', '$log', '$cookies', '$q', '$location'];
  function AuthenticationFactory($rootScope, firebaseConfig, $log, $cookies, $q, $location){

    if(!firebase.isInit){
      firebase.initializeApp(firebaseConfig);
      firebase.isInit = true;
    }

    var auth = {};

    auth.getCurrentUser = function(cb){
      return firebase.auth().onAuthStateChanged(function(user) {
        if(user) {
          updateCurrentUser(user);
          if(cb) cb(user);
          $log.debug('auth.getCurrentUser currentUser = ' + user);
        } else {
          updateCurrentUser();
          $log.debug('Not user');
        }
      });

    }

    auth.getCurrentUser();

    auth.updateProfile = function(name, url, cb){
      var user = firebase.auth().currentUser;
      if(user){
        var hash = {owner: 'null'};
        if(name) hash.displayName = name;
        if(url) hash.photoURL = url;
        user.updateProfile(hash)
          .then(function() {
            user = firebase.auth().currentUser;
            updateCurrentUser(user);
            if(cb) cb(user);
          }, function(error){
            updateCurrentUser();
            if(cb) cb(null, error);
          })
      }else{
        $log.debug('Not user');
      }

    }

    auth.createNewUser = function(email, password, cb){
      return firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function(data){
          updateCurrentUser(data);
          if(cb) cb(data);
        })
        .catch(function(error) {
          updateCurrentUser();
          if(cb) cb(null, error);
          $log.error('Login error = ' + error);
        });
    }

    auth.signInAnonymously = function(cb){
      return firebase.auth().signInAnonymously()
        .then(function(user){
          updateCurrentUser(user);
          if(cb) cb(user);
        })
        .catch(function(error) {
          updateCurrentUser();
          if(cb) cb(null, error);
        });
    }

    auth.convertAnonymous = function(email, password, cb){
      var credential = firebase.auth.EmailAuthProvider.credential(email, password);
      var user = firebase.auth().currentUser;
      user.link(credential).then(
        function(user) {
          $log.debug("Anonymous account successfully upgraded", user);
          if(cb) cb(user);
        },function(error) {
          $log.debug("Error upgrading anonymous account", error);
          if(cb) cb(null, error);
        }
      );
    }

    auth.login = function(email, password, cb){
      return firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function(data){
          updateCurrentUser(data);
          if(cb) cb(data);
        })
        .catch(function(error) {
          updateCurrentUser();
          if(cb) cb(null, error);
          $log.error('Login error = ' + error);
        });
    };

    auth.logout = function(cb){
      return firebase.auth().signOut()
        .then(function(data) {
          updateCurrentUser();
          if(cb) cb(data);
        }).catch(function(error) {
          updateCurrentUser();
          if(cb) cb(null, error);
          $log.debug('Logout error');
        });
    };

    function updateCurrentUser(user){
      if(user){
        $rootScope.currentUser = user;
        $cookies.put('uid', user.uid);
        $rootScope.needAuth = false;
      }else{
        $rootScope.currentUser = null;
        $cookies.remove('uid');
      }
    }

    auth.getUserName = function(){
      if(!$cookies.get('uid'))
        return null;
      else
        return $cookies.get('uid');
    }

    auth.signedIn = function(){
      if(auth.getUserName()){
        return true;
      }else{
        $location.path('/#');
        $rootScope.needAuth = true;
        return $q.reject({unAuthorized: true});
      }
    }

    $rootScope.signedIn = function(){
      return !!auth.getUserName();
    };

    return auth;
  }

})();

;(function(){
  'use strict';

  angular.module('ngFit.auth.http', [])
    .constant('SERVER_URL', 'http://62.109.17.114/')
    .factory('Auth', AuthFactory)

  AuthFactory.$inject = ['$http', '$log', 'SERVER_URL', '$cookies'];
  function AuthFactory($http, $log, SERVER_URL, $cookies) {
    //delete $http.defaults.headers.common['X-Requested-With'];
    //$http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
    var auth_token = 'xxxxYYYYZzzz';
    var user_id = '1';
    var auth = {};

    auth.user = null;

    auth.login = function(_username, _password, cb){
      var auth_url = SERVER_URL + 'auth?login=' + _username + '&password=' + _password;
      return $http({
        method: 'GET',
        url: auth_url,
        dataType: 'jsonp',
        headers: {'Authorization': 'Token token=xxxxYYYYZzzz'}
      })
        .success(function(status){
          alert('Success = ' + status);
        })
        .error(function(status){
          //$log.debug('auth.login = ');
          $cookies.put('auth_token', auth_token);
          $cookies.put('user_id', user_id);
          $cookies.put('username', _username);
          auth.user = {
            id: user_id,
            username: _username,
            hash: {}
          }
          if(cb) cb(auth.user);
          $('#sign-in-modal').modal('hide');
        });
    }

    auth.logout = function(){
      auth.user = null;
      $cookies.remove('auth_token');
      $cookies.remove('user_id');
      $cookies.remove('username');
    }

    auth.getUserName = function(){
      if(auth.user && auth.user.username){
        return auth.user.username
      }else if($cookies.get('username')){
        return $cookies.get('username');
      }
      return null;
    }

    return auth;
  }
})();

;(function(){
  'use strict';

  angular
    .module('ngFit.fitfire.factory', ['firebase'])
    .factory('fitfireFactory', fitfireFactory);

  fitfireFactory.$inject = ['$log','firebaseConfig', '$firebaseObject', '$firebaseArray'];
  function fitfireFactory($log, firebaseConfig, $firebaseObject, $firebaseArray){

    if(!firebase.isInit){
      firebase.initializeApp(firebaseConfig);
      firebase.isInit = true;
    }

    var dataBase = firebase.database();

    function addUser(user){
      var userLength = $firebaseObject(dataBase.ref('options/userLength'));
      return userLength.$loaded(function() {
        var newLength = ++userLength.$value;
        userLength.$save();
        var users = dataBase.ref('users');
        users.child(newLength).set(user);
      });
    }

    function updateUser(_user){
      var user = dataBase.ref('users/' + _user.$id);
      user.set({
        name: _user.name,
        age: _user.age
      });
      return $firebaseArray(user).$loaded();
    }

    function deleteUser(_user){
      var user = dataBase.ref('users/' + _user.$id);
      user.remove();
      return $firebaseArray(user).$loaded();
    }

    function getUsers(cb){
      var users = $firebaseArray(dataBase.ref('users'));
      return users.$loaded(cb);
    }

    return function(){
      return getUsers().then(function(data){
        return {
          users: data,
          addUser: addUser,
          updateUser: updateUser,
          deleteUser: deleteUser
        };
      });
    }

  }
})();


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

;(function(){
  'use strict';

  angular
    .module('ngFit.main',['ngRoute', 'ngFit.fitfire.service'])
    .config(MainConfig)
    .controller('MainCtrl', MainCtrl)

  MainCtrl.$inject = ['$scope', '$rootScope', 'FIREBASE_URL', '$log', 'fitfireService'];
  function MainCtrl($scope, $rootScope, FIREBASE_URL, $log, fitfireService){
    var vm = this;
    $rootScope.curPath = 'main';
    $rootScope.pageClass = 'page-main';

    var currentProvider = fitfireService;

    vm.userProvider = '"fitfireService"';

    vm.url = FIREBASE_URL;
    vm.title = 'Это наш MainCtrl';

    vm.name = 'Loftschool';

    vm.userForm = false;

    if($rootScope.needAuth) $('#sign-in-modal').modal('show');

    vm.user = {
      id: null,
      name: null,
      age: 0
    }

    currentProvider.getUsers(function(data){
      vm.users = data;
    });

    currentProvider.getUsers().then(function(data){
      vm.users = data;
    }).catch(function(err){
      $log.debug(err);
    });

    vm.openCloseUserForm = function(key, reset){
      if(reset) vm.defaultUser();
      vm.userForm = key?true:false;
    }

    vm.defaultUser = function(name, age){
      vm.user = {
        id: null,
        name: null,
        age: 0
      }
    }

    vm.addUser = function(){
      currentProvider.addUser(vm.user).then(function(){
        vm.openCloseUserForm(0, 1);
      });
    }

    vm.updateUser = function(){
      currentProvider.updateUser(vm.user).then(function(){
        vm.openCloseUserForm(0, 1);
      });
    }

    vm.deleteUser = function(user){
      if(user) vm.user = user;
      currentProvider.deleteUser(vm.user).then(function(){
        vm.openCloseUserForm(0, 1);
      });
    }

    vm.setEdit = function(user){
      if($rootScope.currentUser.isAnonymous) return;
      vm.user = user;
      vm.openCloseUserForm(1);
    }

    vm.defaultUser();

    $scope.clickFunction = function(name){
      alert('Hi, ' + name);
    }

  }

  MainConfig.$inject = ['$routeProvider'];
  function MainConfig($routeProvider){

    $routeProvider
      .when('/', {
        templateUrl: '/app/main/main.html',
        controller: 'MainCtrl',
        controllerAs: 'vm'
      });

  }

})();
;(function(){
  'use strict';

  angular.module('ngFit.about',['ngRoute'])
    .config(AboutConfig)
    //.provider('providerName', providerName)
    .controller('AboutCtrl', AboutCtrl)

  function providerName(){
    return{
      name: 'Test',
      $get: function(){
        return {
          name: this.name
        }
      }
    }
  }

  AboutCtrl.$inject = ['$rootScope'];
  function AboutCtrl($rootScope){
    var vm = this;

    //$log.debug(signedIn);

    $rootScope.curPath = 'about';
    $rootScope.pageClass = 'page-about';
    vm.title = 'Это наш AboutCtrl';
    vm.arr = [1,2,3,4,5,6,7];
  }

  AboutConfig.$inject = ['$routeProvider'];
  function AboutConfig($routeProvider){
    $routeProvider
      .when('/about', {
        templateUrl: '/app/components/about/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'vm',
        resolve: {
          /* @ngInject */
          signedIn: ["Auth", function(Auth){ // redirect not logged
            return Auth.signedIn();
          }]
        }
      });
  }

})();


;(function(){
  'use strict';

  angular.module('ngFit.contact',['ngRoute', 'ngFit.fitfire.factory'])
    .config(ContactConfig)
    .controller('ContactCtrl', ContactCtrl);

  ContactCtrl.$inject = ['$scope', '$rootScope', 'firebaseConfig', '$log', 'usersFactory'];
  function ContactCtrl($scope, $rootScope, firebaseConfig, $log, currentProvider){
    var vm = this;
    $rootScope.curPath = 'contact';
    $rootScope.pageClass = 'page-contact';

    vm.userProvider = '"usersFactory"';

    vm.title = 'Это наш ContactCtrl';

    vm.dbUrl = firebaseConfig.databaseURL;

    vm.user = null;

    vm.users = currentProvider.users;

    $scope.$on('init', function(event, data){
      vm.title = 'Новый титл' + data;
      console.log('contact init event', event, data);
    });

  }

  ContactConfig.$inject = ['$routeProvider'];
  function ContactConfig($routeProvider){
    $routeProvider
      .when('/contact', {
        templateUrl: '/app/components/contact/contact.html',
        controller: 'ContactCtrl',
        controllerAs: 'vm',
        resolve: {
          /* @ngInject */
          usersFactory: ["fitfireFactory", function(fitfireFactory){
            return fitfireFactory();
          }],
          /* @ngInject */
          signedIn: ["Auth", function(Auth){ // redirect not logged
            return Auth.signedIn();
          }]
        }
      });
  }

})();
;(function(){
  'use strict';

  var custom = angular.module('ngFit.custom', ['ngFit.auth.firebase']);

  //// .directive('customOnChange', customOnChange) //////
  custom.directive('customOnChange', customOnChange);
  function customOnChange(){
    return {
      restrict: 'A',
      scope:{handler: '&'},
      link: function (scope, element, attrs) {
        element.on('change', function (event) {
          scope.$apply(function(){
            var files = event.target.files;
            if(attrs.initType) files.initType = attrs.initType;
            scope.handler({files: event.target.files});
          });
        });
      }
    }
  }
  //// .directive('customOnChange', customOnChange) //////

  ////// .directive('customUpload', customUpload); ////////
  custom.directive('customUpload', customUpload);
  function customUpload(){
    return {
      restrict: 'E',
      scope: {progress: '=progress', fileName:'=filename', handler: '&'},
      controller: customUploadCtrl,
      controllerAs: 'custUplCtrl',
      bindToController: true,
      template:/* @ngInject */
        `<div class="upload-file-component" style="position: relative;">
          <input type="file" ng-model="custUplCtrl.files" custom-on-change handler="custUplCtrl.handlerChange(files)"/>
          <div class="input-group" style="width: 100%;">
            <input readonly="" class="form-control" ng-model="custUplCtrl.fileName" placeholder="User photo" type="text"/>
            <span class="input-group-btn input-group-sm" ng-class="{'notEmptyFile': custUplCtrl.notEmptyFile}" ng-hide="custUplCtrl.afterUpload">
              <button type="button" class="btn btn-fab btn-fab-mini" title="Upload">
                <i class="glyphicon glyphicon-paperclip" aria-hidden="true"></i>
              </button>
            </span>
          </div>
          <div class="progress" ng-show="custUplCtrl.progress > 0">
            <div class="progress-bar progress-bar-info" ng-style="{width: custUplCtrl.getProgress()}"></div>
          </div>
        </div>
        <div ng-show="custUplCtrl.upload_error" class="alert alert-danger" style="margin: 5px 0 0 0">Error! {{custUplCtrl.upload_error.message}}</div>`
    }
  }

  customUploadCtrl.$inject = ['$rootScope', '$scope', '$log'];
  function customUploadCtrl($rootScope, $scope, $log){
    var vm = this;

    vm.files = null;
    vm.upload_error = null;
    //vm.fileName = null;

    vm.progress = 0;
    vm.notEmptyFile = false
    vm.afterUpload = false;

    vm.getProgress = function(){
      return vm.progress + '%';
    }

    vm.handlerChange = function(files){
      if(files.length){
        var str = '';
        for(var i= 0; i < files.length; i++){
          if(i > 0) str += ', ';
          str += files[i].name;
        }
        vm.fileName = str;
        vm.notEmptyFile = files.length?true:false;
        vm.files = files.length?files:null;
      }else{
        vm.fileName = null;
        $log.debug('Empty');
      }
      vm.handler({files: files});
    }
  }
  ////// .directive('customUpload', customUpload); ////////

  ////// .directive('customPaginator', customPaginator) ////////
  custom.directive('customPaginator', customPaginator);
  /* @ngInject */
  function customPaginator(){
    return {
      restrict: 'E',
      scope: {data: '=data', currentPage: '=currentPage', itemsPerPage:'=itemsPerPage', handler: '&'},
      controller: custPaginatorCtrl,
      controllerAs: 'custPgnCtrl',
      bindToController: true,
      template:/* @ngInject */
        `<div>
          <div class="jumbotron ipp-block" style="margin-top: 10px !important;">
            <span style="line-height: 28px; padding-right: 5px;">Total in list: {{custPgnCtrl.totalItems}}</span>
          </div>
          <ul class="pagination custom-pagination" ng-show="custPgnCtrl.allPages.length > 1">
            <li ng-class="{'disabled': custPgnCtrl.currentPage == 0}"><a href="javascript:void(0)" ng-click="custPgnCtrl.prevPage()"><span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span></a></li>
            <li ng-show="custPgnCtrl.currentPage > 2"><span>...</span></li>
            <li ng-show="n > custPgnCtrl.currentPage - 3 && n < custPgnCtrl.currentPage + 3" ng-class="{'active': custPgnCtrl.currentPage == n}" ng-repeat="n in custPgnCtrl.allPages"><a href="javascript:void(0)" ng-click="custPgnCtrl.setCurrentPage(n)">{{n+1}}</a></li>
            <li ng-show="custPgnCtrl.currentPage < custPgnCtrl.allPages.length - 3"><span>...</span></li>
            <li ng-class="{'disabled': custPgnCtrl.currentPage == custPgnCtrl.allPages.length - 1}"><a href="javascript:void(0)" ng-click="custPgnCtrl.nextPage()"><span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span></a></li>
          </ul>
        </div>`
    }
  }

  custPaginatorCtrl.$inject = ['$rootScope', '$scope', '$log'];
  function custPaginatorCtrl($rootScope, $scope, $log){
    var vm = this;

    vm.totalItems = 0;
    vm.allPages = [];

    vm.setCurrentPage = function(page){
      vm.currentPage = page;
      vm.handler({page: vm.currentPage});
    }

    vm.prevPage = function () {
      if (vm.currentPage > 0) {
        vm.currentPage--;
      }
      vm.handler({page: vm.currentPage});
    };

    vm.nextPage = function () {
      if (vm.currentPage < vm.allPages.length-1) {
        vm.currentPage++;
      }
      vm.handler({page: vm.currentPage});
    };

    $scope.$watch('custPgnCtrl.data', function(newVal) {
      $log.debug('custPgnCtrl.data');
      if(newVal){
        vm.totalItems = newVal.length;
        //vm.itemsPerPage = Math.ceil(vm.totalItems / 8);
        var pagesCount = Math.ceil(vm.totalItems / vm.itemsPerPage);
        vm.allPages = [];
        for (var i = 0; i < pagesCount; i++) {
          vm.allPages.push(i);
        }
      }
    });

    $scope.$watch('custPgnCtrl.itemsPerPage', function(newVal) {
      if(newVal){
        vm.itemsPerPage = newVal;
        //vm.itemsPerPage = Math.ceil(vm.totalItems / 8);
        var pagesCount = Math.ceil(vm.totalItems / vm.itemsPerPage);
        vm.allPages = [];
        for (var i = 0; i < pagesCount; i++) {
          vm.allPages.push(i);
        }
      }
    });

  }
  ////// .directive('customPaginator', customPaginator) ////////

  ////// .directive('customArrows', customArrows); ////////
  custom.directive('customArrows', customArrows);
  function customArrows(){
    return {
      restrict: 'E',
      scope: {name: '@', sortBy: '=sortBy', sortTo: '=sortTo'},
      controller: function(){},
      controllerAs: 'custArrCtrl',
      bindToController: true,
      template:/* @ngInject */
        `<span ng-show="custArrCtrl.sortBy==custArrCtrl.name && !custArrCtrl.sortTo" class="glyphicon glyphicon-sort-by-attributes red" aria-hidden="true"></span>
         <span ng-show="custArrCtrl.sortBy==custArrCtrl.name && custArrCtrl.sortTo" class="glyphicon glyphicon-sort-by-attributes-alt red" aria-hidden="true"></span>
         <span ng-show="custArrCtrl.sortBy!=custArrCtrl.name" class="glyphicon glyphicon-sort" aria-hidden="true"></span>`
    }
  }
  ////// .directive('customArrows', customArrows); ////////

  ////// .directive('customSelect', customSelect); ////////
  custom.directive('customSelect', customSelect);

  customSelect.$inject = ['$compile', '$log'];
  function customSelect($compile, $log){
    return{
      restrict: 'A',
      scope: {external: '=', ngModel: '=', remove: '@'},
      controller: customSelectCtrl,
      link: function(scope, element, attrs){
        scope.element = element;

        scope.$watch(element.find('option'), function(){
          var options = '';
          element.find('option').each(function(){
            options += `<li ng-class="{'selected': ngModel.id == '` + $(this).attr('value') + `'}"><a href="javascript:void(0)" ng-click="setSelected('` + $(this).attr('value') + `', '` + $(this).html() + `')">` + $(this).html() + `</a></li>`;
          });
          var str = `<div class="dropdown dropdown-custom">
          <button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown"><span ng-bind="ngModel.name"></span>
            <span class="caret"></span>
          </button>
          <ul class="dropdown-menu dropdown-menu-custom">`;
          str += options;
          str += `</ul>
          </div>`;
          //str += `<div>External: {{ external }}</div>`;
          scope.newElement = angular.element(str);
          element.before(scope.newElement);
          $compile(scope.newElement)(scope);
          if(scope.remove) element.remove();

          scope.newElement.find('button').bind('click', function(){
            var $$ = $(this);
            if($$.attr('aria-expanded') != 'true'){
              setTimeout(function(){
                var container = $$.parent().find('ul');
                var selected = container.find('li.selected');
                var top = container.find('li').index(selected) * selected.height();
                container.animate({scrollTop: top}, 100);
              }, 10);
            }
          });

        })
      }
    }
  }

  customSelectCtrl.$inject = ['$scope'];
  function customSelectCtrl($scope){

    $scope.setSelected = function(id, name){
      $scope.newElement.find('span:first').html(name);
      if($scope.element){
        $($scope.element).val(id);
        $scope.ngModel = {id: id, name: name};
      }
      if($scope.external) $scope.external = name;
    }
  }
  ////// .directive('customSelect', customSelect); ////////


  custom.directive('enter', function(){
    return{
      restrict: 'AE',
      scope: {
        enter: '='
      },
      controller: ["$scope", function($scope){
        $scope.enter = 'Init value for enter'
      }],
      template: '<input type="text" name="enterTTitle" ng-model="enter"/><br/><h3>{{ enter }}</h3>',
      link: function(scope, element){
        //$log.debug('link = ', scope, element);
        element.find('h3').addClass('btn btn-info');
        element.mouseenter(function(){
          //$log.debug("I'm enter in element");
        })
      }
    }
  });

  custom.directive('leave', function(){
    return function(scope, element){
      element.mouseleave(function(){
        //$log.debug("I'm leave element");
      })
    }
  });

  custom.directive('example', function(){
    return{
      restrict: 'A',
      scope:{},
      transclude: true,
      template: '!!<ng-transclude></ng-transclude>!!',
      controller: ["$scope", function($scope){
        $scope.abilities = [];

        this.addStrenth = function(){
          $scope.abilities.push('strength');
        }
        this.addSpeed = function(){
          $scope.abilities.push('speed');
        }
        this.addFlight = function(){
          $scope.abilities.push('flight');
        }
      }],
      link: function(scope, element, attrs){
        element.addClass('btn btn-info');
        element.bind('mouseenter', function(){
          //$log.debug(scope.abilities);
          element.removeClass('btn-info').addClass(attrs.example);
        })
        element.bind('mouseleave', function(){
          element.removeClass(attrs.example).addClass('btn-info');
        })
      }
    }
  });

  custom.directive('strength', function(){
    return{
      require: 'example',
      link: function(scope, element, attrs, ctrl){
        ctrl.addStrenth();
      }
    }
  });

  custom.directive('speed', function(){
    return{
      require: 'example',
      link: function(scope, element, attrs, ctrl){
        ctrl.addSpeed();
      }
    }
  });

  custom.directive('flight', function(){
    return{
      require: 'example',
      link: function(scope, element, attrs, ctrl){
        ctrl.addFlight();
      }
    }
  });

})();
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
;(function(){
  'use strict';

  angular.module('ngFit.users', ['ngFit.fitfire.service'])
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
  .filter('offset', offsetFilter)

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
      console.log(min, max);
      return array;
    };
  }

  function anonimFilter(){
    return function(val){
      //console.log('Anonim');
      return val > 0?'':' (Anonim)';
    }
  }

  usersListCtrl.$inject = ['$rootScope', '$scope', '$element', '$log', 'fitfireService', 'firebaseConfig', '$filter'];
  function usersListCtrl($rootScope, $scope, $element, $log, currentProvider, firebaseConfig, $filter){
    var vm = this;

    vm.userProvider = '"fitfireService"';

    /*var customViewType = $($element).attr('view-type');
    vm.userViewType = customViewType && customViewType.length?customViewType:'"Include"';*/

    var editType = $($element).attr('edit');
    vm.editType = editType?true:false;

    vm.userForm = false;

    vm.dbUrl = firebaseConfig.databaseURL;

    vm.user = {};
    vm.users = null;
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
      }
      $log.debug('vm.users', newVal);
    });

    $rootScope.$watch('currentUser', function(newVal) {
      vm.getFiltredUsers();
      vm.likeCurrentUsers = $filter('forCurrentUser')(vm.users, $rootScope);
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
        owner: 'null'
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
          usersFactory: ["fitfireFactory", function(fitfireFactory){
            return fitfireFactory();
          }]
        }
      });
  }

})();
