;(function(){
  'use strict';

  var custom = angular.module('ngFit.custom', ['ngFit.auth.firebase']);

  custom.directive('likeTable', ['$rootScope', '$window', '$timeout', '$log', function($rootScope, $window, $timeout, $log){
    return {
      restrict: 'C',
      controller: function($rootScope, $scope, $log){},
      link: function(scope, element, attrs){

        /*var updateDateTimer = null;
        scope.$on('ListObjectChanged', function(){
          console.log('custom.js likeTable ListObjectChanged: getLogedUsers()');
          clearTimeout(updateDateTimer);
          updateDateTimer = setTimeout(function(){
            //updateDate(scope, element, attrs);
          }, 100);
        });*/

        scope.$watch(attrs['update'], function(newVal) {
            //clearTimeout(updateDateTimer);
            updateDate(scope, element, attrs);
        });

        function updateDate(scope, element, attrs){
          $(element).find('.like-table-br').remove();
          $(element).find('.like-table-td').remove();
          $(element).find('.like-table-td-inner').removeClass('like-table-td-inner');

          $(element).find('> *').each(function(index){
            var $$ = $(this);
            $$.find('> *').each(function(){
              var $$$ = $(this);
              $$$.addClass('like-table-row');
              if($$$.hasClass('block-content')) $$$.addClass('like-table-row-content');
            });
            $$.addClass('like-table-td-inner');
            $$.wrap('<div class="like-table-td"></div>');
            $$.parent().after('<div class="like-table-br"></div>');
          });

          scope.likeTableTimer = null;
          angular.element($window).bind('resize', function(){
            clearTimeout(scope.likeTableTimer);
            scope.likeTableTimer = $timeout(function(){
              if(element.parent().hasClass('like-table-wrap')) element.unwrap('<div class="like-table-wrap"></div>');
              else element.wrap('<div class="like-table-wrap"></div>');
            }, 10);
          });
        }
      }
    }
  }]);

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
      /*controllerAs: 'custArrCtrl',
      bindToController: true,*/
      template:/* @ngInject */
        `<span ng-show="sortBy==name && !sortTo" class="glyphicon glyphicon-sort-by-attributes red" aria-hidden="true"></span>
         <span ng-show="sortBy==name && sortTo" class="glyphicon glyphicon-sort-by-attributes-alt red" aria-hidden="true"></span>
         <span ng-show="sortBy!=name" class="glyphicon glyphicon-sort" aria-hidden="true"></span>`
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
      controller: function($scope){
        $scope.enter = 'Init value for enter'
      },
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

  custom.directive('autocompleteInput', ['$window', '$timeout', function($window, $timeout){
    return{
      restrict: 'E',
      scope: {ngModel: '=', list: '=', inLineValue: '@', name: '@', controlClass: '@', style: '@', handler: '&'},
      template: `<div style="position: relative; {{style}}">
                  <input type="text" name="{{name}}" id="{{name}}" ng-model="ngModel" class="{{controlClass}}" style="width: 100%; position: relative; z-index: 11;" ng-keyup="keyUpEvent()"/>
                  <div class="autocomplete-list" ng-show="list.length">
                    <a ng-repeat="item in list" ng-click="setValue(item)" style="white-space: nowrap; display: block;">{{ item[inLineValue] }}</a>
                  </div>
                 </div>`,
      controller: function($scope){
        $scope.setValue = function(item){
          $scope.ngModel = item[$scope.inLineValue];
          $scope.closeAutocompleteList();
        }
        $scope.closeAutocompleteList = function(){
          $scope.list = [];
        }
        $scope.keyUpEventTimer = null;
        $scope.keyUpEvent = function(){
          clearTimeout($scope.keyUpEventTimer);
          $scope.keyUpEventTimer = $timeout(function(){
            $scope.handler({str: $scope.ngModel, value: $scope.inLineValue});
          }, 500);
        }
      },
      link: function(scope, element){
        angular.element($window).bind('click', function(e){
          scope.closeAutocompleteList();
          scope.$apply();
        })
      }
    }
  }])

  custom.directive('example', function(){
    return{
      restrict: 'A',
      scope:{},
      transclude: true,
      template: '!!<ng-transclude></ng-transclude>!!',
      controller: function($scope){
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
      },
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