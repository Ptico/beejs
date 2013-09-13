define(['base/event'], function(event) {
  'use strict';

  describe('Event', function() {

    describe('Configurable target', function() {
      var target, spy;

      beforeEach(function() {
        spy = sinon.spy();
      });

      it('should broadcast event', function() {
        target = new event.Target({ broadcast: true });

        event.on('hello', spy);
        target.fire('hello');

        expect(spy).to.be.called();
        event.off('hello');
      });

      it('should broadcast event with prefix', function() {
        target = new event.Target({ broadcast: true, prefix: 'world' });

        event.on('world:hello', spy);
        target.fire('hello');

        expect(spy).to.be.called();
        event.off('world:hello');
      });

      it('should fire default function', function() {
        var spyTwo = sinon.spy();

        target = new event.Target({ defaultFn: spy });

        target.on('defaultfn', spyTwo);
        target.fire('defaultfn');

        expect(spy).to.be.called();
        expect(spyTwo).to.be.called();
        expect(spy).to.be.calledAfter(spyTwo);
      });
    });

  });

});