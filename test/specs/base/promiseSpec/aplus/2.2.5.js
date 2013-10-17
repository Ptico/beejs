define(function(require) {
  /*jshint strict: false */

  var Promise = require('base/promise'),
      dummy   = { dummy: 'dummy' },
      global  = this;

  describe('2.2.5 `onFulfilled` and `onRejected` must be called as functions (i.e. with no `this` value).', function() {
    describe('strict mode', function() {
      specify('fulfilled', function(done) {
        Promise.resolved(dummy).then(function onFulfilled() {
          'use strict';

          expect(this).to.be(undefined);
          done();
        });
      });

      specify('rejected', function(done) {
        Promise.rejected(dummy).then(null, function onRejected() {
          'use strict';

          expect(this).to.be(undefined);
          done();
        });
      });
    });

    describe('sloppy mode', function() {
      specify('fulfilled', function(done) {
        Promise.resolved(dummy).then(function onFulfilled() {
          expect(this).to.be.equal(global)
          done();
        });
      });

      specify('rejected', function(done) {
        Promise.rejected(dummy).then(null, function onRejected() {
          expect(this).to.be.equal(global);
          done();
        });
      });
    });
  });

});
