define(["base/event"], function(event) {
  describe("Event", function() {

    describe("Object", function() {
      var spy;

      beforeEach(function() {
        spy = sinon.spy();
      });

      it("should attach/fire events", function() {
        event.on("hello", spy);
        event.fire("hello");

        expect(spy).to.be.called();
        event.off("hello"); // Cleanup
      });

      it("should attach/fire events", function() {
        event.on("hello", spy);
        event.fire("hello");

        expect(spy).to.be.called();
        event.off("hello"); // Cleanup
      });

      it("should detach events", function() {
        event.on("foo", spy);
        event.off("foo");
        event.fire("foo");

        expect(spy).to.not.be.called();
      });

      it("should detach event handler", function() {
        var spyTwo = sinon.spy();

        event.on("foo", spy);
        event.on("foo", spyTwo);

        event.off("foo", spyTwo);
        event.fire("foo");

        expect(spy).to.be.called();
        expect(spyTwo).to.not.be.called();
        event.off("foo");
      });

      it("should fire event once", function() {
        event.once("onetime", spy);
        event.fire("onetime");
        event.fire("onetime");

        expect(spy).to.be.calledOnce();
      });

      it("should fire before callback", function() {
        var spyTwo = sinon.spy();

        event.on("update", spy);
        event.before("update", spyTwo);

        event.fire("update");

        expect(spy).to.be.called();
        expect(spyTwo).to.be.called();
        expect(spyTwo).to.be.calledBefore(spy);
        event.off("update");
      });

      it("should fire after callback", function() {
        var spyTwo = sinon.spy();

        event.after("update", spyTwo);
        event.on("update", spy);

        event.fire("update");

        expect(spy).to.be.called();
        expect(spyTwo).to.be.called();
        expect(spyTwo).to.be.calledAfter(spy);
        event.off("update");
      });
    });

    describe("Wildcard", function() {
      var spy;

      beforeEach(function() {
        spy = sinon.spy();
      });

      it("should fire events by '*:event' wildcard", function() {
        event.on("*:change", spy);
        event.fire("name:change");

        expect(spy).to.be.called();
        event.off("*:change");
      });

      it("should fire events by 'event:*' wildcard", function() {
        event.on("name:*", spy);
        event.fire("name:set");

        expect(spy).to.be.called();
        event.off("name:*");
      });
    });

    describe("Constructor configurable", function() {
      var target, spy;

      beforeEach(function() {
        spy = sinon.spy();
      });

      it("should broadcast event", function() {
        target = new event.Target({ broadcast: true });

        event.on("hello", spy);
        target.fire("hello");

        expect(spy).to.be.called();
        event.off("hello");
      });

      it("should broadcast event with prefix", function() {
        target = new event.Target({ broadcast: true, prefix: "world" });

        event.on("world:hello", spy);
        target.fire("hello");

        expect(spy).to.be.called();
        event.off("world:hello");
      });

      it("should fire default function", function() {
        var spyTwo = sinon.spy();

        target = new event.Target({ defaultFn: spy });

        target.on("defaultfn", spyTwo);
        target.fire("defaultfn");

        expect(spy).to.be.called();
        expect(spyTwo).to.be.called();
        expect(spy).to.be.calledAfter(spyTwo);
      });
    });

    describe("Configurable", function() {
      var target, spy;

      beforeEach(function() {
        target = new event.Target();
        spy    = sinon.spy();
      });

      it("should broadcast event", function() {
        target.event("hello", { broadcast: true });

        event.on("hello", spy);
        target.fire("hello");

        expect(spy).to.be.called();
        event.off("hello");
      });

      it("should broadcast event with prefix", function() {
        target.event("hello", { broadcast: true, prefix: "world" });

        event.on("world:hello", spy);
        target.fire("hello");

        expect(spy).to.be.called();
        event.off("world:hello");
      });

      it("should fire default function", function() {
        var spyTwo = sinon.spy();
        target.event("defaultfn", { defaultFn: spy });

        target.on("defaultfn", spyTwo);
        target.fire("defaultfn");

        expect(spy).to.be.called();
        expect(spyTwo).to.be.called();
        expect(spy).to.be.calledAfter(spyTwo);
      });

      it("should fire events once", function() {
        var spyTwo = sinon.spy();

        target.event("onceev", { once: true });

        target.on("onceev", spy);
        target.on("onceev", spyTwo);

        target.fire("onceev");
        target.fire("onceev");

        expect(spy).to.be.calledOnce();
        expect(spyTwo).to.be.calledOnce();
      });

      it("should delay event handling", function() {
        target.event("work", { delayed: true });

        target.on("work", spy);

        target.fire("work");

        expect(spy).to.not.be.called();
      });

      it("should fire delayed", function() {
        var spyTwo   = sinon.spy(),
            spyThree = sinon.spy();

        target.event("work", { delayed: true });
        target.event("eat", { delayed: true });
        target.event("sleep", { delayed: true });

        target.on("work", spy);
        target.on("eat", spyTwo);
        target.on("sleep", spyThree);

        target.fire("work");
        target.fire("eat");

        target.fireDelayed();

        expect(spy).to.be.called();
        expect(spyTwo).to.be.called();
        expect(spyThree).to.not.be.called();
      });
    });

    describe("Bubbling", function() {
      var root, parent, children,
          spyOne, spyTwo, spyThree;

      beforeEach(function() {
        root     = new event.Target;
        parent   = new event.Target;
        children = new event.Target;
        spyOne   = sinon.spy();
        spyTwo   = sinon.spy();
        spyThree = sinon.spy();

        children.addTarget(parent);
        parent.addTarget(root);
      });

      it("should bubble", function() {
        children.on("bubble", spyOne);
        parent.on("bubble", spyTwo);
        root.on("bubble", spyThree);

        children.fire("bubble");

        expect(spyOne).to.be.called();
        expect(spyTwo).to.be.called();
        expect(spyThree).to.be.called();
      });

      it("should detect bubbling", function() {
        children.on("bubble", function(ev) {
          if (ev.bubbles) spyOne();
        });

        parent.on("bubble", function(ev) {
          if (ev.bubbles) spyTwo();
        });

        root.on("bubble", function(ev) {
          if (ev.bubbles) spyThree();
        });

        children.fire("bubble");

        expect(spyOne).to.not.be.called();
        expect(spyTwo).to.be.called();
        expect(spyThree).to.be.called();
      });

      it("should bubble with prefix", function() {
        var trace    = [],
            callback = function(ev) { trace.push(ev.type); };

        root     = new event.Target;
        parent   = new event.Target({ prefix: "parent" });
        children = new event.Target({ prefix: "children" });

        children.addTarget(parent);
        parent.addTarget(root);

        children.on("bubble", callback);
        parent.on("children:bubble", callback);
        root.on("children:bubble", callback);

        parent.on("bubble", spyOne);
        root.on("bubble", spyOne);
        root.on("parent:bubble", spyOne);
        root.on("parent:children:bubble", spyOne);

        children.fire("bubble");

        expect(trace).to.eql(["children:bubble", "children:bubble", "children:bubble"]);
        expect(spyOne).to.not.be.called();
      });
    });

    describe("Event facade", function() {
      var target, spyOne, spyTwo;

      beforeEach(function() {
        target = new event.Target();
        spyOne = sinon.spy();
        spyTwo = sinon.spy();
      });

      it("should add original name of the event", function() {
        var type;

        target.on("name:*", function(data) {
          type = data.type;
        });

        target.fire("name:change", { name: 'ptico' });

        expect(type).to.be.equal("name:change");
      });

      it("should stops event", function() {
        target.on("breakeable", spyOne);

        target.on("breakeable", function(ev) {
          ev.stop();
          spyOne();
        });

        target.on("breakeable", spyTwo);

        target.fire("breakeable");

        expect(spyOne).to.be.calledTwice();
        expect(spyTwo).to.not.be.called();
      });

      it("should prevent default", function() {
        target.event("preventable", { defaultFn: spyTwo });

        target.on("preventable", function(ev) {
          ev.preventDefault();
          spyOne();
        });

        target.fire("preventable");

        expect(spyOne).to.be.called();
        expect(spyTwo).to.not.be.called();
      });

      it("should prevent bubbling", function() {
        var parent = new event.Target();

        target.addTarget(parent);
        target.event("preventable", { defaultFn: spyOne });

        target.on("preventable", function(ev) {
          ev.stopPropagation();
          spyOne();
        });
        parent.event("preventable", spyTwo);

        target.fire("preventable");

        expect(spyOne).to.be.calledTwice();
        expect(spyTwo).to.not.be.called();
      });
    });

  });
});