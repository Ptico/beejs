define(function(require) {
  'use strict';

  var Promise = require('base/promise'),
      helpers = require('spec/base/promiseSpec/aplus/helpers/testThreeCases'),
      testFulfilled = helpers.testFulfilled,
      testRejected  = helpers.testRejected,
      dummy = { dummy: 'dummy' };

  describe('2.2.4: `onFulfilled` or `onRejected` must not be called until the execution context stack contains only ' +
           'platform code.', function() {

    describe('`then` returns before the promise becomes fulfilled or rejected', function() {
      testFulfilled(dummy, function(promise, done) {
        var thenHasReturned = false;

        promise.then(function onFulfilled() {
          expect(thenHasReturned).to.be(true);
          done();
        });

        thenHasReturned = true;
      });

      testRejected(dummy, function(promise, done) {
        var thenHasReturned = false;

        promise.then(null, function onRejected() {
          expect(thenHasReturned).to.be(true);
          done();
        });

        thenHasReturned = true;
      });
    });

    describe('Clean-stack execution ordering tests (fulfillment case)', function() {

      specify('when `onFulfilled` is added immediately before the promise is fulfilled', function() {
        var d = Promise.deferred(),
            onFulfilledCalled = false;

        d.promise.then(function onFulfilled() {
          onFulfilledCalled = true;
        });

        d.resolve(dummy);

        expect(onFulfilledCalled).to.be(false)
      });

      specify('when `onFulfilled` is added immediately after the promise is fulfilled', function() {
        var d = Promise.deferred(),
            onFulfilledCalled = false;

        d.resolve(dummy);

        d.promise.then(function onFulfilled() {
          onFulfilledCalled = true;
        });

        expect(onFulfilledCalled).to.be(false);
      });

      specify('when one `onFulfilled` is added inside another `onFulfilled`', function(done) {
        var promise = Promise.resolved(),
            firstOnFulfilledFinished = false;

        promise.then(function() {
          promise.then(function() {
            expect(firstOnFulfilledFinished).to.be(true);
            done();
          });

          firstOnFulfilledFinished = true;
        });
      });

      specify('when `onFulfilled` is added inside an `onRejected`', function(done) {
        var promise  = Promise.rejected(),
            promise2 = Promise.resolved(),
            firstOnRejectedFinished = false;

        promise.then(null, function() {
          promise2.then(function() {
            expect(firstOnRejectedFinished).to.be(true);
            done();
          });

          firstOnRejectedFinished = true;
        });
      });

      specify('when the promise is fulfilled asynchronously', function(done) {
        var d = Promise.deferred(),
            firstStackFinished = false;

        setTimeout(function() {
          d.resolve(dummy);
          firstStackFinished = true;
        }, 0);

        d.promise.then(function() {
          expect(firstStackFinished).to.be(true);
          done();
        });
      });
    });

    describe('Clean-stack execution ordering tests (rejection case)', function() {
      specify('when `onRejected` is added immediately before the promise is rejected', function() {
        var d = Promise.deferred(),
            onRejectedCalled = false;

        d.promise.then(null, function onRejected() {
          onRejectedCalled = true;
        });

        d.reject(dummy);

        expect(onRejectedCalled).to.be(false);
      });

      specify('when `onRejected` is added immediately after the promise is rejected', function() {
        var d = Promise.deferred(),
            onRejectedCalled = false;

        d.reject(dummy);

        d.promise.then(null, function onRejected() {
          onRejectedCalled = true;
        });

        expect(onRejectedCalled).to.be(false);
      });

      specify('when `onRejected` is added inside an `onFulfilled`', function(done) {
        var promise  = Promise.resolved(),
            promise2 = Promise.rejected(),
            firstOnFulfilledFinished = false;

        promise.then(function() {
          promise2.then(null, function() {
            expect(firstOnFulfilledFinished).to.be(true);
            done();
          });

          firstOnFulfilledFinished = true;
        });
      });

      specify('when one `onRejected` is added inside another `onRejected`', function(done) {
        var promise = Promise.rejected(),
            firstOnRejectedFinished = false;

        promise.then(null, function() {
          promise.then(null, function() {
            expect(firstOnRejectedFinished).to.be(true);
            done();
          });

          firstOnRejectedFinished = true;
        });
      });

      specify('when the promise is rejected asynchronously', function(done) {
        var d = Promise.deferred(),
            firstStackFinished = false;

        setTimeout(function() {
          d.reject(dummy);
          firstStackFinished = true;
        }, 0);

        d.promise.then(null, function() {
          expect(firstStackFinished).to.be(true);
          done();
        });
      });
    });
  });

});
