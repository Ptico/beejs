define(['base/attribute'], function(attr) {
  'use strict';

  describe('Attribute', function() {

    describe('Configurable target', function() {
      it('can set only configured attributes');

      it('can set custom validators', function() {
        var obj = new attr.Target({
          validators: {
            email: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
            length: {
              test: function(val) {
                return (val.length > 3);
              }
            }
          }
        });

        obj.attribute('email', { validate: 'email' });
        obj.attribute('name', { validate: 'length' });

        expect(obj.set('email', 'foo')).to.not.be.ok();
        expect(obj.set('name', 'fo')).to.not.be.ok();
      });

      it('can set custom persistence layer', function() {
        var storage    = {},
            storageObj = {
              get: function(obj, key) {
                return storage[key];
              },
              set: function(obj, key, val) {
                storage[key] = val;
              },
              erase: function(obj, key) {
                delete storage[key]
              }
            },
            obj = new attr.Target({ storage: storageObj });

        obj.set('one', 1);
        obj.set('two', 2);
        obj.erase('two');

        expect(obj.get('one')).to.be.equal(1);
        expect(obj.get('two')).to.be.an('undefined');
      });
    });

  });

});