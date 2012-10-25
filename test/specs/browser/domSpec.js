define(["browser/dom", "fixtures/domFixtures"], function(dom, fixtures) {
  describe("DOM", function() {
    describe("DomWrapper", function() {
      beforeEach(function() {
        fixtures.fill("wrapper");
      });

      afterEach(function() {
        fixtures.clear();
      });

      it("should filter anonymous nodes", function() {
        var nodes = fixtures.get().childNodes,
            wrap  = new dom.Wrapper(nodes);

        expect(wrap.length).to.be.equal(5);
        expect(wrap[wrap.length - 1].id).to.be.equal("last");
      });

    });

  });
});