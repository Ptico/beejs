define(['base/attribute'], function(attr) {
  'use strict';

  describe('Attribute', function() {

    describe('Configurable attribute', function() {
      var obj;

      beforeEach(function() {
        obj = new attr.Target;
      });

      it('should configure default value', function() {
        obj.attribute('hello', { defaultVal: 'world' });

        expect(obj.get('hello')).to.be.equal('world');
      });

      it('should configure setter', function() {
        obj.attribute('hello', {
          setter: function(value) {
            return 'Hello ' + value;
          }
        });

        obj.set('hello', 'world');

        expect(obj.get('hello')).to.be.equal('Hello world');
      });

      it('should configure getter', function() {
        obj.attribute('hello', {
          getter: function(value) {
            return 'Hello ' + value;
          }
        });

        obj.set('hello', 'world');
        expect(obj.get('hello')).to.be.equal('Hello world');
      });

      it('should configure getter with default value', function() {
        obj.attribute('hello', {
          defaultVal: 'world',
          getter: function(value) {
            return 'Hello ' + value;
          }
        });

        expect(obj.get('hello')).to.be.equal('Hello world');
        expect(obj.get('hello', 'universe')).to.be.equal('Hello universe');
      });

      it('should convert types', function() {
        obj.attribute('name', { type: 'string' });
        obj.attribute('age', { type: 'number' });

        obj.set('name', ['John', 'Doe']);
        obj.set('age', '25');

        expect(obj.get('name')).to.be.equal('John,Doe');
        expect(obj.get('age')).to.be.equal(25);
      });

      it('should fail with regex validator', function() {
        obj.attribute('email', {
          validate: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
        });

        expect(obj.set('email', 'foo')).to.not.be.ok();
        expect(obj.get('email')).to.be.an('undefined');
      });

      it('should pass with regex validator', function() {
        obj.attribute('email', {
          validate: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
        });

        expect(obj.set('email', 'john@example.com')).to.be.ok();
        expect(obj.get('email')).to.be.equal('john@example.com');
      });

      it('should fail with function validator', function() {
        obj.attribute('name', {
          validate: function(val) {
            return (val.length > 3);
          }
        });

        expect(obj.set('name', 'fo')).to.not.be.ok();
        expect(obj.get('name')).to.be.an('undefined');
      });

      it('should fail with function validator', function() {
        obj.attribute('name', {
          validate: function(val) {
            return (val.length > 3);
          }
        });

        expect(obj.set('name', 'John')).to.be.ok();
        expect(obj.get('name')).to.be.equal('John');
      });
    });

  });

});