define(["base/attribute", "browser/cookieStore"], function(attr, cookieStore) {
  describe("Cookie store", function() {
    var cook;

    beforeEach(function() {
      cook = new attr.Target({ storage: cookieStore });
      cook.eraseAll();
    });

    it("should set/get attribute", function() {
      cook.set("foo", "bar");

      expect(cook.get("foo")).to.equal("bar");
    });

    it("should pass default value to get", function() {
      expect(cook.get("foo", "baz")).to.be.equal("baz");
    });

    it("should erase attribute", function() {
      cook.set("foo", "bar");
      cook.erase("foo");

      expect(cook.get("foo")).to.be.an("undefined");
    });

    it("should erase all attributes", function() {
      cook.set("foo", "bar");
      cook.set("hello", "word");
      cook.eraseAll();

      expect(cook.keys()).to.be.eql([]);
    });

    it("should find keys", function() {
      cook.set("foo", "bar");

      expect(cook.has("foo")).to.be.ok();
      expect(cook.has("bar")).to.not.be.ok();
    });

    it("should find all keys", function() {
      cook.set("foo", "bar");
      cook.set("hello", "world");

      expect(cook.keys()).to.be.eql(["foo", "hello"]);
    });

    xit("should store objects", function() { // Disabled because of PhantomJS bug
      cook.set("foo", { a: "baz", b: 2 });

      var result = cook.get("foo");

      expect(result.a).to.be.equal("baz");
      expect(result.b).to.be.equal(2);
    });

  });
});