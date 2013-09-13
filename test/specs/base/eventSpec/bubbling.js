define(['base/event'], function(event) {
  'use strict';

  describe('Event', function() {

    describe('Bubbling', function() {
      var root, parent, children,
          spyOne, spyTwo, spyThree;

      beforeEach(function() {
        root     = new event.Target();
        parent   = new event.Target();
        children = new event.Target();

        spyOne   = sinon.spy();
        spyTwo   = sinon.spy();
        spyThree = sinon.spy();

        children.addTarget(parent);
        parent.addTarget(root);
      });

      it('should bubble', function() {
        children.on('bubble', spyOne);
        parent.on('bubble', spyTwo);
        root.on('bubble', spyThree);

        children.fire('bubble');

        expect(spyOne).to.be.called();
        expect(spyTwo).to.be.called();
        expect(spyThree).to.be.called();
      });

      it('should detect bubbling', function() {
        children.on('bubble', function(ev) {
          if (ev.bubbles) spyOne();
        });

        parent.on('bubble', function(ev) {
          if (ev.bubbles) spyTwo();
        });

        root.on('bubble', function(ev) {
          if (ev.bubbles) spyThree();
        });

        children.fire('bubble');

        expect(spyOne).to.not.be.called();
        expect(spyTwo).to.be.called();
        expect(spyThree).to.be.called();
      });

      it('should bubble with prefix', function() {
        var trace    = [],
            callback = function(ev) { trace.push(ev.type); };

        root     = new event.Target;
        parent   = new event.Target({ prefix: 'parent' });
        children = new event.Target({ prefix: 'children' });

        children.addTarget(parent);
        parent.addTarget(root);

        children.on('bubble', callback);
        parent.on('children:bubble', callback);
        root.on('children:bubble', callback);

        parent.on('bubble', spyOne);
        root.on('bubble', spyOne);
        root.on('parent:bubble', spyOne);
        root.on('parent:children:bubble', spyOne);

        children.fire('bubble');

        expect(trace).to.eql(['children:bubble', 'children:bubble', 'children:bubble']);
        expect(spyOne).to.not.be.called();
      });
    });
    
  });


});