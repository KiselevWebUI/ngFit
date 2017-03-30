'use strict';

describe('ngFit.about module', function(){

  beforeEach(module('ngFit.about'));

  describe('About Controller', function(){
    var AboutCtrl, scope, signedIn;

    it('should be defined', inject(function($controller){
      AboutCtrl = $controller('AboutCtrl');
      expect(AboutCtrl).toBeDefined();
    }));

    describe('AboutCtrl.arr', function(){

      it('shoud be an array', function(){
        expect(AboutCtrl.arr).toBeDefined();
        expect(typeof AboutCtrl.arr).toEqual('object');
        expect(AboutCtrl.arr.length).toBeGreaterThan(0);
      });

    });

  })

});