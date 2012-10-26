define(["browser/dom", "fixtures/domFixtures"], function(dom, fixtures) {
  describe("DOM", function() {
    describe("DOMWrapper", function() {
      beforeEach(function() {
        fixtures.load("wrapper");
      });

      afterEach(fixtures.clear);

      it("should have enumerator functions", function() {
        var nodes = fixtures.get().childNodes,
            wrap  = new dom.Wrapper(nodes);

        expect(wrap.sortBy).to.be.a("function");
        expect(wrap.pluck("className")).to.be.eql(["one", "two", "three", "", "five"]);
      });

      it("should have array functions", function() {
        var wrap = new dom.Wrapper();

        expect(wrap.push).to.be.equal(Array.prototype.push);
      });

      it("should filter anonymous nodes", function() {
        var nodes = fixtures.get().childNodes,
            wrap  = new dom.Wrapper(nodes);

        expect(wrap.length).to.be.equal(5);
        expect(wrap.last().id).to.be.equal("last");
      });

      it("should be marked as wrapped", function() {
        var nodes = fixtures.get().childNodes,
            wrap  = new dom.Wrapper(nodes);

        expect(wrap.wrapped).to.be.ok();
      });

      it("should just return already wrapped node", function() {
        var node = document.getElementById("first"),
            wrap = new dom.Wrapper(node),
            doub = new dom.Wrapper(wrap);

        expect(doub).to.be.equal(wrap);
      });
    });

    describe("dom object", function() {
      it("should return wrapped object", function() {
        var result = dom(document);

        expect(result).to.be.a(dom.Wrapper);
      });

      it("should work fine with selector engine", function() {
        fixtures.load("selector");

        expect(dom("div")).to.be.a(dom.Wrapper);
        expect(dom("[disabled]")[0].tagName.toLowerCase()).to.be.equal("button");
        expect(dom("span.one").length).to.be.equal(1);

        fixtures.clear();
      });

      it("should get element by id with #id function", function() {
        var result = dom.id("fixtures");

        expect(result).to.be.a(dom.Wrapper);
        expect(result[0].tagName.toLowerCase()).to.be.equal("div");
        expect(result.length).to.be.equal(1);
      });

      it("should cache window.document", function() {
        expect(dom.root).to.be.a(dom.Wrapper);
        expect(dom.root[0].nodeName).to.be.equal("#document");
      });
    });

    describe("Finder", function() {
      beforeEach(function() {
        fixtures.load("finder");
      });

      afterEach(fixtures.clear);

      it("should find inside the previous result", function() {
        var result = dom(".parent-one"),
            subs   = result.find(".child");

        expect(subs.length).to.be.equal(2);
      });

      it("should find inside the multiple results", function() {
        var result = dom(".parent"),
            subs   = result.find(".child");

        expect(subs.length).to.be.equal(4);
      });
    });

    describe("Classes", function() {
      beforeEach(function() {
        fixtures.load("classes");
      });

      afterEach(fixtures.clear);

      it("should check for class name", function() {
        var testOne = dom.id("has-class"),
            testTwo = dom("#fixtures .foo");

        expect(testOne.hasClass("foo")).to.be.ok();
        expect(testOne.hasClass("bar")).to.be.ok();
        expect(testOne.hasClass("two-parts")).to.be.ok();
        expect(testOne.hasClass("two_parts")).to.be.ok();

        expect(testOne.hasClass("fail")).to.not.be.ok();
        expect(testOne.hasClass("oo")).to.not.be.ok();
        expect(testOne.hasClass("two")).to.not.be.ok();
        expect(testOne.hasClass("parts")).to.not.be.ok();

        expect(testTwo.hasClass("foo")).to.be.ok();
        expect(testTwo.hasClass("baz")).to.be.ok();
        expect(testTwo.hasClass("two_parts")).to.be.ok();

        expect(testTwo.hasClass("parts")).to.not.be.ok();
      });
    });

  });
});