define(["browser/dom", "fixtures/domFixtures", "browser/event"], function(dom, fixtures) {
  describe("DOM Events", function() {
    beforeEach(function() {
      fixtures.load("events");
    });

    afterEach(fixtures.clear);

    describe("Basic features", function() {
      it("should attach event", function() {
        var spy = sinon.spy();

        dom(".test-span").on("click", spy);

        dom.id("span-1").fire("click");

        expect(spy).to.be.calledOnce();
      });

      it("should attach event to multiple elements", function() {
        var spy = sinon.spy();

        dom(".test-span").on("click", spy);

        dom.id("span-1").fire("click");
        dom.id("span-2").fire("click");

        expect(spy).to.be.calledTwice();
      });

      it("should detach event", function() {
        var spyOne = sinon.spy(),
            spyTwo = sinon.spy();

        dom(".test-span").on("click", spyOne).on("click", spyTwo);

        dom(".test-span").off("click");

        dom.id("span-1").fire("click");
        dom.id("span-2").fire("click");

        expect(spyOne).to.not.be.called();
        expect(spyTwo).to.not.be.called();
      });

      it("should detach event handler", function() {
        var spyOne = sinon.spy(),
            spyTwo = sinon.spy();

        dom(".test-span").on("click", spyOne).on("click", spyTwo);

        dom(".test-span").off("click", spyTwo);

        dom.id("span-1").fire("click");

        expect(spyOne).to.be.calledOnce();
        expect(spyTwo).to.not.be.called();
      });

      it("should attach event once", function() {
        var spyOne = sinon.spy(),
            spyTwo = sinon.spy();

        dom(".test-span").on("click", spyOne).once("click", spyTwo);

        dom.id("span-1").fire("click");
        dom.id("span-1").fire("click");

        expect(spyOne).to.be.calledTwice();
        expect(spyTwo).to.be.calledOnce();
      });

      it("should bind this", function() {
        var obj = {};

        dom(".test-span").on("click", function() {
          this.hello = "world";
        }, obj)

        dom.id("span-1").fire("click");

        expect(obj.hello).to.be.equal("world");
      });

      it("should pass element as an argument", function() {
        var obj = {};

        dom(".test-span").on("click", function(ev, el) {
          this.element = el;
        }, obj)

        dom.id("span-1").fire("click");

        expect(obj.element).to.be.equal(dom.id("span-1")[0]);
      });
    });

    describe("Event fix", function() {
      it("should prevent default", function() {
        dom(".test-link").on("click", function(ev) {
          ev.preventDefault();
        });

        dom(".test-link").fire("click");

        expect(window.location.pathname).to.not.be.equal("/test/1");
      });

      it("should stop propagation", function() {
        var spy = sinon.spy();

        dom.id("test-delegation").on("click", ".test-span", spy);

        dom(".test-span").on("click", function(ev) {
          ev.stopPropagation();
        });

        dom(".test-span").fire("click");

        expect(spy).to.not.be.called();
      });

      it("should stop propagation and cancel default", function() {
        var spyOne = sinon.spy(),
            spyTwo = sinon.spy();

        dom.id("test-delegation").on("click", ".test-span", spyOne);

        dom(".test-link").on("click", function(ev) {
          ev.stop();
        }).on("click", spyTwo);

        dom(".test-link").fire("click");

        expect(window.location.pathname).to.not.be.equal("/test/1");
        expect(spyOne).to.not.be.called();
        expect(spyTwo).to.not.be.called();
      });

      it("should contains event target", function() {
        var obj = {};

        dom(".test-span").on("click", function(ev, el) {
          this.element = ev.target;
        }, obj)

        dom.id("span-1").fire("click");

        expect(obj.element).to.be.equal(dom.id("span-1")[0]);
      });
    });

    describe("Delegation", function() {
      it("should delegate event", function() {
        var spy = sinon.spy();

        dom("#test-delegation").on("click", ".test-span", spy);

        dom.id("span-1").fire("click");

        expect(spy).to.be.calledOnce();
      });

      it("should detach delegated event", function() {
        var spyOne = sinon.spy(),
            spyTwo = sinon.spy();

        dom("#test-delegation").on("click", ".test-span", spyOne);
        dom("#test-delegation").on("click", ".test-span", spyTwo);

        dom("#test-delegation").off("click", ".test-span");

        dom.id("span-1").fire("click");

        expect(spyOne).to.not.be.called();
        expect(spyTwo).to.not.be.called();
      });

      it("should detach delegated event handler", function() {
        var spyOne = sinon.spy(),
            spyTwo = sinon.spy();

        dom("#test-delegation").on("click", ".test-span", spyOne);
        dom("#test-delegation").on("click", ".test-span", spyTwo);

        dom("#test-delegation").off("click", ".test-span", spyTwo);

        dom.id("span-1").fire("click");

        expect(spyOne).to.be.called();
        expect(spyTwo).to.not.be.called();
      });

      it("should delegate event once", function() {
        var spyOne = sinon.spy(),
            spyTwo = sinon.spy();

        dom("#test-delegation").on("click", ".test-span", spyOne);
        dom("#test-delegation").once("click", ".test-span", spyTwo);

        dom.id("span-1").fire("click");
        dom.id("span-1").fire("click");

        expect(spyOne).to.be.calledTwice();
        expect(spyTwo).to.be.calledOnce();
      });

      it("should bind this for delegators", function() {
        var obj = {};

        dom("#test-delegation").on("click", ".test-span", function() {
          this.hello = "world";
        }, obj);

        dom.id("span-1").fire("click");

        expect(obj.hello).to.be.equal("world");
      });

      it("should have an original target", function() {
        var obj = {};

        dom("#test-delegation").on("click", ".test-span", function(ev) {
          this.element = ev.target;
        }, obj);

        dom.id("span-1").fire("click");

        expect(obj.element).to.be.equal(dom.id("span-1")[0]);
      });
    });
  });
});