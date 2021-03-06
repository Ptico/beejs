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
        var nodeOne = dom.id("has-class"),
            nodeTwo = dom("#fixtures .foo");

        expect(nodeOne.hasClass("foo")).to.be.ok();
        expect(nodeOne.hasClass("bar")).to.be.ok();
        expect(nodeOne.hasClass("two-parts")).to.be.ok();
        expect(nodeOne.hasClass("two_parts")).to.be.ok();

        expect(nodeOne.hasClass("fail")).to.not.be.ok();
        expect(nodeOne.hasClass("oo")).to.not.be.ok();
        expect(nodeOne.hasClass("two")).to.not.be.ok();
        expect(nodeOne.hasClass("parts")).to.not.be.ok();

        expect(nodeTwo.hasClass("foo")).to.be.ok();
        expect(nodeTwo.hasClass("baz")).to.be.ok();
        expect(nodeTwo.hasClass("two_parts")).to.be.ok();

        expect(nodeTwo.hasClass("parts")).to.not.be.ok();
      });

      it("should add class name", function() {
        var nodeOne = dom.id("has-class"),
            nodeTwo = dom("#fixtures .foo");

        nodeOne.addClass("boo");
        nodeOne.addClass("bar");

        nodeTwo.addClass("mult");

        expect(nodeOne[0].className).to.be.equal("foo bar two-parts two_parts boo mult");
        expect(nodeTwo[1].className).to.be.equal("foo baz mult");
      });

      it("should add class names", function() {
        var nodeOne = dom.id("has-class"),
            nodeTwo = dom("#fixtures .baz");

        nodeOne.addClass("foo", "boo", "mult");
        nodeTwo.addClass(["foo", "boo", "mult"]);
        nodeTwo.addClass("xyz zyx");

        expect(nodeOne[0].className).to.be.equal("foo bar two-parts two_parts boo mult");
        expect(nodeTwo[0].className).to.be.equal("foo baz boo mult xyz zyx");
      });

      it("should remove class name", function() {
        var nodeOne = dom.id("has-class"),
            nodeTwo = dom("#fixtures .foo");

        nodeOne.removeClass("two-parts");
        nodeOne.removeClass("two_parts");

        nodeTwo.removeClass("foo");
        nodeTwo.removeClass("baz");

        expect(nodeOne[0].className).to.be.equal("bar");
        expect(nodeTwo[1].className).to.be.equal("");
      });

      it("should remove class names", function() {
        var nodeOne = dom.id("has-class"),
            nodeTwo = dom("#fixtures .foo");

        nodeOne.removeClass("two-parts", "two_parts");

        nodeTwo.removeClass("bar foo");

        expect(nodeOne[0].className).to.be.equal("");
        expect(nodeTwo[1].className).to.be.equal("baz");
      });
    });

    describe("Attributes", function() {
      beforeEach(function() {
        fixtures.load("attributes");
      });

      afterEach(fixtures.clear);

      describe("getter", function() {
        it("should get simple attributes", function() {
          var nodeOne = dom.id("text-input");

          expect(nodeOne.get("id")).to.be.equal("text-input");
          expect(nodeOne.get("type")).to.be.equal("text");
          expect(nodeOne.get("placeholder")).to.be.equal("User");
          expect(nodeOne.get("name")).to.be.equal("username");
        });

        it("should get camelCased attributes", function() {
          expect(dom.id("checkbox-checked").get("tabindex")).to.be.equal("2");
        });

        it("should get properties", function() {
          var nodeOne = dom.id("test-label"),
              nodeTwo = dom.id("inner-html");

          expect(nodeOne.get("class")).to.be.equal("custom-label");
          expect(nodeOne.get("for")).to.be.equal("text-input");
          expect(nodeOne.get("text")).to.be.equal("User name");

          expect(nodeTwo.get("html")).to.be.equal("<i>Inner</i>");
        });

        it("should get custom attributes", function() {
          var nodeOne = dom.id("test-label"),
              nodeTwo = dom.id("text-input");

          expect(nodeOne.get("style")).to.be.equal("color: red;");
          expect(nodeOne.get("tag")).to.be.equal("label");

          expect(nodeTwo.get("value")).to.be.equal("ptico");
        });

        it("should get boolean attributes", function() {
          var nodeOne = dom.id("checkbox-checked"),
              nodeTwo = dom.id("checkbox-not-checked"),
              nodeThree = dom("#select-input option");

          expect(nodeOne.get("checked")).to.be.ok();
          expect(nodeTwo.get("checked")).to.not.be.ok();

          expect(nodeThree.eq(0).get("selected")).to.not.be.ok();
          expect(nodeThree.eq(1).get("selected")).to.be.ok();

          expect(nodeOne.get("readonly")).to.not.be.ok();
          expect(nodeTwo.get("readonly")).to.be.ok();
        });

        it("should get value for button", function() {
          expect(dom.id("button-input").get("value")).to.be.equal("Press me");
        });

        it("should get value for select", function() {
          expect(dom.id("select-input").get("value")).to.be.equal("platinum");
          expect(dom.id("select-multiple").get("value")).to.be.eql(["1", "3"]);
        });
      });

      describe("setter", function() {
        it("should set simple attributes", function() {
          dom.id("text-input").set("placeholder", "Nickname");

          expect(dom.id("text-input").get("placeholder")).to.be.equal("Nickname");
        });

        it("should set camelCased attributes", function() {
          dom.id("checkbox-checked").set("tabindex", 3);

          expect(dom.id("checkbox-checked").get("tabindex")).to.be.equal("3");
        });

        it("should set properties", function() {
          dom.id("inner-html").set("html", "<b>Changed</b>");
          dom.id("text-input").set("class", "hello world");
          dom.id("test-label").set("for", "checkbox-checked");
          dom.id("test-label").set("text", "Checkbox label");

          expect(dom.id("inner-html").get("html")).to.be.equal("<b>Changed</b>");
          expect(dom.id("text-input").hasClass("hello")).to.be.ok();
          expect(dom.id("test-label").get("for")).to.be.equal("checkbox-checked");
          expect(dom.id("test-label").get("text")).to.be.equal("Checkbox label");
        });

        it("should set custom attributes", function() {
          var nodeOne = dom.id("text-input");

          nodeOne.set("value", "Chuck");
          nodeOne.set("style", "color: green;");

          expect(dom.id("text-input").get("value")).to.be.equal("Chuck");
          expect(dom.id("text-input").get("style")).to.be.equal("color: green;");
        });

        it("should set boolean attributes", function() {
          dom.id("checkbox-checked").set("checked", false);
          dom.id("text-input").set("readonly", true);

          expect(dom.id("checkbox-checked").get("checked")).to.not.be.ok();
          expect(dom.id("text-input").get("readonly")).to.be.ok();
        });

        it("should set value for buttons", function() {
          dom.id("button-input").set("value", "Don't touch me");

          expect(dom.id("button-input").get("value")).to.be.equal("Don't touch me");
        });

        it("should set value for select", function() {
          dom.id("select-input").set("value", "member");
          dom.id("select-multiple").set("value", ["1", "2"]);

          expect(dom.id("select-input").get("value")).to.be.equal("member");
          expect(dom.id("select-multiple").get("value")).to.be.eql(["1", "2"]);
        });
      });

      describe("eraser", function() {
        it("should erase simple attributes", function() {
          dom.id("text-input").erase("placeholder");

          expect(dom.id("text-input").get("placeholder")).to.be.equal("");
        });

        it("should erase camelCased attributes", function() {
          dom.id("checkbox-checked").erase("tabindex");

          expect(dom.id("checkbox-checked").get("tabindex")).to.be.equal("");
        });

        it("should erase properties", function() {
          var nodeOne = dom.id("test-label"),
              nodeTwo = dom.id("inner-html");

          nodeOne.erase("class");
          nodeOne.erase("for");
          nodeOne.erase("text");

          nodeTwo.erase("html");

          nodeOne = dom.id("test-label");

          expect(nodeOne.get("class")).to.be.equal("");
          expect(nodeOne.get("for")).to.be.equal("");
          expect(nodeOne.get("text")).to.be.equal("");

          expect(dom.id("test-label").get("html")).to.be.equal("");
        });

        it("should erase custom properties", function() {
          dom.id("test-label").erase("style");

          expect(dom.id("test-label").get("style")).to.be.equal("");
        });

        it("should erase boolean attributes", function() {
          dom.id("checkbox-checked").erase("checked");

          expect(dom.id("checkbox-checked").get("checked")).to.not.be.ok();
        });
      });

      describe("custom attribute", function() {
        it("should configure custom attribute", function() {
          dom.attribute("labelInput", {
            get: function(el) {
              var forId = el.htmlFor;

              return dom.id(forId);
            }
          });

          expect(dom.id("test-label").get("labelInput").get("name")).to.be.equal("username");
        });
      });
    }); // Attribute

    describe("Traversing", function() {
      beforeEach(function() {
        fixtures.load("traversing");
      });

      afterEach(fixtures.clear);

      it("should get all parents", function() {
        var result = dom(".children-one").parents();

        expect(result.eq(0).hasClass("parent-one")).to.be.ok();
        expect(result.eq(1).get("id")).to.be.equal("grandparent");
        expect(result.length).to.be.greaterThan(2);
      });

      it("should get num parents", function() {
        var result = dom(".children-one").parents(2);

        expect(result.length).to.be.equal(2);
      });

      it("should get first level childrens", function() {
        var result = dom.id("grandparent").childrens();

        expect(result.hasClass("parent")).to.be.ok();
        expect(result.length).to.be.equal(2);
      });

      it("should get all siblings", function() {
        var result = dom(".children-five").siblings();

        expect(result.length).to.be.equal(4);
      });

      it("should get siblings witch matches selector", function() {
        var result = dom(".children-five").siblings("div");

        expect(result.length).to.be.equal(3);
      });

      it("should get first parent", function() {
        var result = dom(".children-one").up();

        expect(result.hasClass("parent-one")).to.be.ok();
        expect(result.length).to.be.equal(1);
      });

      it("should get parent by index", function() {
        var result = dom(".children-one").up(1);

        expect(result.get("id")).to.be.equal("grandparent");
      });

      it("should get parent by selector", function() {
        var result = dom(".children-one").up("#grandparent");

        expect(result.get("id")).to.be.equal("grandparent");
      });

      it("should get first children", function() {
        var result = dom.id("grandparent").down();

        expect(result.hasClass("parent-one")).to.be.ok();
      });

      it("should get children by index", function() {
        var result = dom.id("grandparent").down(1);

        expect(result.hasClass("parent-two")).to.be.ok();
      });

      it("should get children of children by index", function() {
        var result = dom.id("grandparent").down(1, 1);

        expect(result.hasClass("children-four")).to.be.ok();
      });

      it("should get next sibling", function() {
        var result = dom(".children-three").next();

        expect(result.hasClass("children-four")).to.be.ok();
      });

      it("should get next sibling by index", function() {
        var result = dom(".children-three").next(2);

        expect(result.hasClass("children-six")).to.be.ok();
      });

      it("should get next sibling by selector", function() {
        var result = dom(".children-three").next("div");

        expect(result.hasClass("children-five")).to.be.ok();
      });

      it("should get next sibling by selector and index", function() {
        var result = dom(".children-three").next("div", 1);

        expect(result.hasClass("children-six")).to.be.ok();
      });

      it("should get previous sibling", function() {
        var result = dom(".children-six").prev();

        expect(result.hasClass("children-five")).to.be.ok();
      });

      it("should get previous sibling by index", function() {
        var result = dom(".children-six").prev(2);

        expect(result.hasClass("children-three")).to.be.ok();
      });

      it("should get previous sibling by selector", function() {
        var result = dom(".children-five").prev("div");

        expect(result.hasClass("children-three")).to.be.ok();
      });

      it("should get previous sibling by selector and index", function() {
        var result = dom(".children-six").prev("div", 1);

        expect(result.hasClass("children-three")).to.be.ok();
      });

      it("should determine index in tree", function() {
        var result = dom(".children-five").index();

        expect(result).to.be.equal(2);
      });
    });

    describe("Manipulations", function() {
      var nodeOne, nodeTwo;

      beforeEach(function() {
        fixtures.load("manipulations");

        nodeOne = dom.id("one");
        nodeTwo = dom.id("two");
      });

      afterEach(fixtures.clear);

      it("should append element", function() {
        nodeOne.insert("bottom", nodeTwo);
      
        expect(nodeTwo.prev().get("id")).to.be.equal("four");
      });
      
      it("should prepend element", function() {
        nodeOne.insert("top", nodeTwo);
      
        expect(nodeTwo.next().get("id")).to.be.equal("three");
      });
      
      it("should insert element before", function() {
        nodeOne.insert("before", nodeTwo);
      
        expect(nodeTwo.next().get("id")).to.be.equal("one");
      });
      
      it("should insert element after", function() {
        nodeOne.insert("after", nodeTwo);
      
        expect(nodeTwo.prev().get("id")).to.be.equal("one");
      });
      
      it("should insert html string", function() {
        nodeOne.insert("top", '<div id="new"></div>');
      
        expect(nodeOne.down().get("id")).to.be.equal("new");
      });
      
      it("should insert multiple elements", function() {
        nodeTwo.insert("top", dom(".inner"));
      
        expect(nodeOne.childrens().length).to.be.equal(0);
        expect(nodeTwo.childrens().length).to.be.equal(2);
        expect(nodeTwo.down().get("id")).to.be.equal("three");
      });

      it("should insert multiple elements to multiple elements", function() {
        dom(".outer").insert("top", dom(".inner"));

        expect(nodeOne.childrens().length).to.be.equal(0);
        expect(nodeTwo.childrens().length).to.be.equal(2);
        expect(dom("#five").childrens().length).to.be.equal(2);
        expect(nodeTwo.down().hasClass("inner")).to.be.ok();
        expect(dom("#five").down().hasClass("inner")).to.be.ok();
      });

      it("should work with complex inserting", function() {
        nodeOne.insert({ top: nodeTwo, after: dom("#five") });

        expect(nodeOne.down().get("id")).to.be.equal("two");
        expect(nodeOne.next().get("id")).to.be.equal("five");
      });

      it("should destroy all elements childrens", function() {
        nodeOne.empty();

        expect(dom("#one").childrens().length).to.be.equal(0);
      }); // .empty(), .clean()

      it("should destroy element", function() {
        nodeOne.destroy();

        expect(dom("#zero").childrens().length).to.be.equal(0);
      });

      it("should destroy element with #remove shortcut", function() {
        nodeOne.remove();

        expect(dom("#zero").childrens().length).to.be.equal(0);
      });

      it("should destroy elements", function() {
        dom(".inner").destroy();

        expect(dom("#one").childrens().length).to.be.equal(0);
      });
    });

  });
});