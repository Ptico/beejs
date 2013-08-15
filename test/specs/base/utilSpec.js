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

    describe('deepMerge', function() {
      it('should deeply merge two objects', function() {
        var a = { a: 1, obj: { a: 'bar', b: [3, 4], c: 'foo' }, arr: [2, { c: 'baz' } ] },
            b = { b: 2, obj: { c: 'baz', b: [5] }, arr: [3, { d: 'foo' }] },
            result = util.deepMerge(a, b);

        expect(result.a).to.be.eql(1);
        expect(result.b).to.be.eql(2);
        expect(result.obj).to.be.eql({ a: 'bar', b: [3, 4, 5], c: 'baz' });
        expect(result.arr).to.be.eql([2, { c: 'baz', d: 'foo' }, 3]);
      });

      it('should merge object into array', function() {
        var a = [1, 2, 3],
            b = { a: 'b' },
            result = util.deepMerge(a, b);

        expect(result).to.be.eql({0: 1, 1: 2, 2: 3, a: 'b'});
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