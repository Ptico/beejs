define(['base/attribute'], function(attr) {
  'use strict';

  describe('Attribute', function() {

    describe('Base', function() {

      var obj;

      beforeEach(function() {
        obj = new attr.Target;
      });

      it("should set/get attribute", function() {
        obj.set("foo", "bar");

        expect(obj.get("foo")).to.equal("bar");
      });

      it("should pass default value to get", function() {
        expect(obj.get("foo", "baz")).to.be.equal("baz");
      });

      it("should erase attribute", function() {
        obj.set("foo", "bar");
        obj.erase("foo");

        expect(obj.get("foo")).to.be.an("undefined");
      });

      it("should erase all attributes", function() {
        obj.set("foo", "bar");
        obj.set("hello", "word");
        obj.eraseAll();

        expect(obj.keys()).to.be.eql({});
      });

      it("should find keys", function() {
        obj.set("foo", "bar");

        expect(obj.has("foo")).to.be.ok();
        expect(obj.has("bar")).to.not.be.ok();
      });

      it("should find all keys", function() {
        obj.set("foo", "bar");
        obj.set("hello", "world");

        expect(obj.keys()).to.be.eql(["foo", "hello"]);
      });

    });

  });

});