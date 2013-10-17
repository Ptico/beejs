define(function(require) {
  'use strict';

  var Promise      = require('base/promise'),
      testRejected = require('spec/base/promiseSpec/aplus/helpers/testThreeCases').testRejected,
      dummy = { dummy: 'dummy' };

  describe('2.1.3.1: When rejected, a promise: must not transition to any other state.', function() {
    testRejected(dummy, function(promise, done) {
      var onRejectedCalled = false;

      promise.then(function onFulfilled() {
        expect(onRejectedCalled).to.be(false);
        done();
      }, function onRejected() {
        onRejectedCalled = true;
      });

      setTimeout(done, 100);
    });

    specify('trying to reject then immediately fulfill', function(done) {
      var d = Promise.deferred(),
          onRejectedCalled = false;

      d.promise.then(function onFulfilled() {
        expect(onRejectedCalled).to.be(false);
        done();
      }, function onRejected() {
        onRejectedCalled = true;
      });

      d.reject(dummy);
      d.resolve(dummy);

      setTimeout(done, 100);
    });

    specify('trying to reject then fulfill, delayed', function(done) {
      var d = Promise.deferred(),
          onRejectedCalled = false;

      d.promise.then(function onFulfilled() {
        expect(onRejectedCalled).to.be(false);
        done();
      }, function onRejected() {
        onRejectedCalled = true;
      });

      setTimeout(function() {
        d.reject(dummy);
        d.resolve(dummy);
      }, 50);

      setTimeout(done, 100);
    });

    specify('trying to reject immediately then fulfill delayed', function(done) {
      var d = Promise.deferred(),
          onRejectedCalled = false;

      d.promise.then(function onFulfilled() {
        expect(onRejectedCalled).to.be(false);
        done();
      }, function onRejected() {
        onRejectedCalled = true;
      });

      d.reject(dummy);

      setTimeout(function() {
        d.resolve(dummy);
      }, 50);

      setTimeout(done, 100);
    });
  });

});
