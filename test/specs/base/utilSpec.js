define(["base/util"], function(util) {
  describe("Utils", function() {
    describe("namespace", function() {
      it("should create local namespace", function() {
        var app = {};

        util.namespace(app, "hello.world");

        expect(app.hello.world).to.be.an("object");
      });

      it("should assign given object to the last part", function() {
        var app = {};

        util.namespace(app, "hello.world", function() {});

        expect(app.hello.world).to.be.a("function");
      });
    });

    describe("strftime", function() {
      var date = new Date("August 24, 1991 15:17:23");

      it("should format weekdays", function() {
        var str = util.strftime(date, "%a/%A/%u");

        expect(str).to.be.equal("Sat/Saturday/6");
      });

      it("should format month", function() {
        var str = util.strftime(date, "%b/%B/%m");

        expect(str).to.be.equal("Aug/August/08");
      });
    });

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