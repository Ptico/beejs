define(["base/attribute"], function(attr) {
  describe("Attribute", function() {
    describe("Simple", function() {
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

    describe("Configurable", function() {
      var obj;

      beforeEach(function() {
        obj = new attr.Target;
      });

      it("should configure default value", function() {
        obj.attribute("hello", { defaultVal: "world" });

        expect(obj.get("hello")).to.be.equal("world");
      });

      it("should configure setter", function() {
        obj.attribute("hello", {
          setter: function(value) {
            return "Hello " + value;
          }
        });

        obj.set("hello", "world");

        expect(obj.get("hello")).to.be.equal("Hello world");
      });

      it("should configure getter", function() {
        obj.attribute("hello", {
          getter: function(value) {
            return "Hello " + value;
          }
        });

        obj.set("hello", "world");
        expect(obj.get("hello")).to.be.equal("Hello world");
      });

      it("should configure getter with default value", function() {
        obj.attribute("hello", {
          defaultVal: "world",
          getter: function(value) {
            return "Hello " + value;
          }
        });

        expect(obj.get("hello")).to.be.equal("Hello world");
        expect(obj.get("hello", "universe")).to.be.equal("Hello universe");
      });

      it("should convert types", function() {
        obj.attribute("name", { type: "string" });
        obj.attribute("age", { type: "number" });

        obj.set("name", ["John", "Doe"]);
        obj.set("age", "25");

        expect(obj.get("name")).to.be.equal("John,Doe");
        expect(obj.get("age")).to.be.equal(25);
      });

      it("should fail with regex validator", function() {
        obj.attribute("email", {
          validate: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
        });

        expect(obj.set("email", "foo")).to.not.be.ok();
        expect(obj.get("email")).to.be.an("undefined");
      });

      it("should pass with regex validator", function() {
        obj.attribute("email", {
          validate: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
        });

        expect(obj.set("email", "john@example.com")).to.be.ok();
        expect(obj.get("email")).to.be.equal("john@example.com");
      });

      it("should fail with function validator", function() {
        obj.attribute("name", {
          validate: function(val) {
            return (val.length > 3);
          }
        });

        expect(obj.set("name", "fo")).to.not.be.ok();
        expect(obj.get("name")).to.be.an("undefined");
      });

      it("should fail with function validator", function() {
        obj.attribute("name", {
          validate: function(val) {
            return (val.length > 3);
          }
        });

        expect(obj.set("name", "John")).to.be.ok();
        expect(obj.get("name")).to.be.equal("John");
      });
    });

    describe("Constructor configurable", function() {
      it("can set only configured attributes");

      it("can set custom validators", function() {
        var obj = new attr.Target({
          validators: {
            email: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
            length: {
              test: function(val) {
                return (val.length > 3);
              }
            }
          }
        });

        obj.attribute("email", { validate: "email" });
        obj.attribute("name", { validate: "length" });

        expect(obj.set("email", "foo")).to.not.be.ok();
        expect(obj.set("name", "fo")).to.not.be.ok();
      });

      it("can set custom persistence layer", function() {
        var storage    = {},
            storageObj = {
              get: function(obj, key) {
                return storage[key];
              },
              set: function(obj, key, val) {
                storage[key] = val;
              },
              erase: function(obj, key) {
                delete storage[key]
              }
            },
            obj = new attr.Target({ storage: storageObj });

        obj.set("one", 1);
        obj.set("two", 2);
        obj.erase("two");

        expect(obj.get("one")).to.be.equal(1);
        expect(obj.get("two")).to.be.an("undefined");
      });
    });

    describe("Object configurable", function() {
      it("can set custom validators");
    });

    describe("Tracking", function() {
      var obj;

      beforeEach(function() {
        obj = new attr.Target;
      });

      it("should save previous value", function() {
        obj.set("hello", "world");
        obj.set("hello", "universe");

        expect(obj.getPrev("hello")).to.be.equal("world");
      });

      it("should not track values which fails validation", function() {
        obj.attribute("name", {
          validate: function(val) {
            return (val.length < 3);
          }
        });

        obj.set("name", "John");
        obj.set("name", "fo");

        expect(obj.getPrev("hello")).to.be.an("undefined");
      });
    });
  });
});