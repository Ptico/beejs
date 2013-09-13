define(['base/event'], function(event) {
  'use strict';

  describe('Event', function() {

    describe('Base', function() {

      var spy, target;

      beforeEach(function() {
        spy = sinon.spy();
        target = new event.Target();
      });

      it('should attach/fire events', function() {
        target.on('hello', spy);
        target.fire('hello');

        expect(spy).to.be.called();
      });

      it('should attach/fire events', function() {
        target.on('hello', spy);
        target.fire('hello');

        expect(spy).to.be.called();
      });

      it('should detach events', function() {
        target.on('foo', spy);
        target.off('foo');
        target.fire('foo');

        expect(spy).to.not.be.called();
      });

      it('should detach event handler', function() {
        var spyTwo = sinon.spy();

        target.on('foo', spy);
        target.on('foo', spyTwo);

        target.off('foo', spyTwo);
        target.fire('foo');

        expect(spy).to.be.called();
        expect(spyTwo).to.not.be.called();
      });

      it('should fire event once', function() {
        target.once('onetime', spy);
        target.fire('onetime');
        target.fire('onetime');

        expect(spy).to.be.calledOnce();
      });

      it('should fire before callback', function() {
        var spyTwo = sinon.spy();

        target.on('update', spy);
        target.before('update', spyTwo);

        target.fire('update');

        expect(spy).to.be.called();
        expect(spyTwo).to.be.called();
        expect(spyTwo).to.be.calledBefore(spy);

      });

      it('should fire after callback', function() {
        var spyTwo = sinon.spy();

        target.after('update', spyTwo);
        target.on('update', spy);

        target.fire('update');

        expect(spy).to.be.called();
        expect(spyTwo).to.be.called();
        expect(spyTwo).to.be.calledAfter(spy);
      });

    });

  });
});