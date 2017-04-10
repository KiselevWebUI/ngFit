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

  //Config.$inject = ['$routeProvider', '$locationProvider', '$logProvider'];
  /* @ngInject */
  function Config($routeProvider, $locationProvider, $logProvider){
    //console.log('Config');
    $routeProvider
      .otherwise({redirectTo: '/'});

    $locationProvider.html5Mode(false);
    $logProvider.debugEnabled(false);
  }

  Run.$inject = ['fitfireService'];
  function Run(fitfireService){
    //console.log('Run');
  }

})();
