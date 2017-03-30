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
          signedIn: function(Auth){ // redirect not logged
            return Auth.signedIn();
          }
        }
      });
  }

})();

