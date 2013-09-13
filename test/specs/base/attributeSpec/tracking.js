define(['base/attribute'], function(attr) {
  'use strict';

  describe('Attribute', function() {

    describe('Tracking', function() {
      var obj;

      beforeEach(function() {
        obj = new attr.Target;
      });

      it('should save previous value', function() {
        obj.set('hello', 'world');
        obj.set('hello', 'universe');

        expect(obj.getPrev('hello')).to.be.equal('world');
      });

      it('should not track values which fails validation', function() {
        obj.attribute('name', {
          validate: function(val) {
            return (val.length < 3);
          }
        });

        obj.set('name', 'John');
        obj.set('name', 'fo');

        expect(obj.getPrev('hello')).to.be.an('undefined');
      });
    });

  });

});