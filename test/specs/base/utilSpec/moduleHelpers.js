define(['base/util'], function(util) {
  describe('Utils', function() {

    describe('Module helpers', function() {
      var Test;

      before(function() {
        Test = function(options) {
          this.constructorCalled = true;
          this.options = options;
        };

        Test.provides = 'test';

        Test.prototype.type = 'module';
      });

      describe('augment', function() {
        var instance;

        beforeEach(function() {
          var Augmented = function(name) {
            this.name = name;

            this._initAncestors();
          };
          util.augment(Augmented, Test, { opt: 'option_one' });
          instance = new Augmented('beejs');
        });

        it('should extend constructor with own props', function() {
          expect(instance.name).to.be.eql('beejs');
          expect(instance.type).to.be.eql('module');
        });

        it('should call module constructor', function() {
          expect(instance.constructorCalled).to.be(true);
          expect(instance.options.opt).to.be.eql('option_one');
        });
      });

      describe('extend', function() {
        var instance;

        beforeEach(function() {
          var Extended = function(name) { this.name = name; };
          instance = new Extended('beejs');
          util.extend(instance, Test, { opt: 'option_two' });
        });

        it('should extend instance with own props', function() {
          expect(instance.name).to.be.eql('beejs');
          expect(instance.type).to.be.eql('module');
        });

        it('should call module constructor', function() {
          expect(instance.constructorCalled).to.be(true);
          expect(instance.options.opt).to.be.eql('option_two');
        });
      });
    });

  });
});