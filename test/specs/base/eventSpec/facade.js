define(['base/event'], function(event) {
  'use strict';

  describe('Event', function() {

    describe('Facade', function() {
      var target, spyOne, spyTwo;

      beforeEach(function() {
        target = new event.Target();

        spyOne = sinon.spy();
        spyTwo = sinon.spy();
      });

      it('should add original name of the event', function() {
        var type;

        target.on('name:*', function(data) {
          type = data.type;
        });

        target.fire('name:change', { name: 'ptico' });

        expect(type).to.be.equal('name:change');
      });

      it('should stops event', function() {
        target.on('breakeable', spyOne);

        target.on('breakeable', function(ev) {
          ev.stop();
          spyOne();
        });

        target.on('breakeable', spyTwo);

        target.fire('breakeable');

        expect(spyOne).to.be.calledTwice();
        expect(spyTwo).to.not.be.called();
      });

      it('should prevent default', function() {
        target.event('preventable', { defaultFn: spyTwo });

        target.on('preventable', function(ev) {
          ev.preventDefault();
          spyOne();
        });

        target.fire('preventable');

        expect(spyOne).to.be.called();
        expect(spyTwo).to.not.be.called();
      });

      it('should prevent bubbling', function() {
        var parent = new event.Target();

        target.addTarget(parent);
        target.event('preventable', { defaultFn: spyOne });

        target.on('preventable', function(ev) {
          ev.stopPropagation();
          spyOne();
        });
        parent.event('preventable', spyTwo);

        target.fire('preventable');

        expect(spyOne).to.be.calledTwice();
        expect(spyTwo).to.not.be.called();
      });
    });

  });

});
