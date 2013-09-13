define(['base/event'], function(event) {
  'use strict';

  describe('Event', function() {

    describe('Wildcard', function() {
      var spy, target;

      beforeEach(function() {
        spy = sinon.spy();
        target = new event.Target();
      });

      it('should fire events by "*:event" wildcard', function() {
        target.on('*:change', spy);
        target.fire('name:change');

        expect(spy).to.be.called();
      });

      it('should fire events by "event:*" wildcard', function() {
        target.on('name:*', spy);
        target.fire('name:set');

        expect(spy).to.be.called();
      });
    });

  });

});