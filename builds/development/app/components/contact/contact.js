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
          usersFactory: function(fitfireFactory){
            return fitfireFactory();
          },
          /* @ngInject */
          signedIn: function(Auth){ // redirect not logged
            return Auth.signedIn();
          }
        }
      });
  }

})();