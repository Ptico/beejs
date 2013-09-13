define(['base/event'], function(event) {
  'use strict';

  describe('Event', function() {

    describe('Configurable event', function() {
      var target, spy;

      beforeEach(function() {
        target = new event.Target();
        spy    = sinon.spy();
      });

      it('should broadcast event', function() {
        target.event('hello', { broadcast: true });

        event.on('hello', spy);
        target.fire('hello');

        expect(spy).to.be.called();
        event.off('hello');
      });

      it('should broadcast event with prefix', function() {
        target.event('hello', { broadcast: true, prefix: 'world' });

        event.on('world:hello', spy);
        target.fire('hello');

        expect(spy).to.be.called();
        event.off('world:hello');
      });

      it('should fire default function', function() {
        var spyTwo = sinon.spy();
        target.event('defaultfn', { defaultFn: spy });

        target.on('defaultfn', spyTwo);
        target.fire('defaultfn');

        expect(spy).to.be.called();
        expect(spyTwo).to.be.called();
        expect(spy).to.be.calledAfter(spyTwo);
      });

      it('should fire events once', function() {
        var spyTwo = sinon.spy();

        target.event('onceev', { once: true });

        target.on('onceev', spy);
        target.on('onceev', spyTwo);

        target.fire('onceev');
        target.fire('onceev');

        expect(spy).to.be.calledOnce();
        expect(spyTwo).to.be.calledOnce();
      });

      it('should delay event handling', function() {
        target.event('work', { deferred: true });

        target.on('work', spy);

        target.fire('work');

        expect(spy).to.not.be.called();
      });

      it('should fire deferred', function() {
        var spyTwo   = sinon.spy(),
            spyThree = sinon.spy();

        target.event('work', { deferred: true });
        target.event('eat', { deferred: true });
        target.event('sleep', { deferred: true });

        target.on('work', spy);
        target.on('eat', spyTwo);
        target.on('sleep', spyThree);

        target.fire('work');
        target.fire('eat');

        target.resolve();

        expect(spy).to.be.called();
        expect(spyTwo).to.be.called();
        expect(spyThree).to.not.be.called();
      });
    });

  });

});