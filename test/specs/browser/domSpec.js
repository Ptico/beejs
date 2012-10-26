define(["browser/dom", "fixtures/domFixtures"], function(dom, fixtures) {
  describe("DOM", function() {
    describe("DOMWrapper", function() {
      beforeEach(function() {
        fixtures.fill("wrapper");
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
        fixtures.fill("selector");

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

  });
});