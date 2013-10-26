define(function(require) {
  'use strict';

  var Promise       = require('base/promise'),
      testFulfilled = require('spec/base/promiseSpec/aplus/helpers/testThreeCases').testFulfilled,
      dummy    = { dummy: 'dummy' },
      sentinel = { sentinel: 'sentinel' };

  describe('2.2.2: If `onFulfilled` is a function,', function() {

    describe('2.2.2.1: it must be called after `promise` is fulfilled, with `promise`’s fulfillment value as its ' +
             'first argument.', function() {

      testFulfilled(sentinel, function(promise, done) {
        promise.then(function onFulfilled(value) {
          expect(value).to.be.equal(sentinel);
          done();
        });
      });
    });

    describe('2.2.2.2: it must not be called before `promise` is fulfilled', function() {
      specify('fulfilled after a delay', function(done) {
        var d = Promise.deferred(),
            isFulfilled = false;

        d.promise.then(function onFulfilled() {
          expect(isFulfilled).to.be(true)
          done();
        });

        setTimeout(function() {
          d.resolve(dummy);
          isFulfilled = true;
        }, 50);
      });

      specify('never fulfilled', function(done) {
        var d = Promise.deferred(),
            onFulfilledCalled = false;

        d.promise.then(function onFulfilled() {
          onFulfilledCalled = true;
          done();
        });

        setTimeout(function() {
          expect(onFulfilledCalled).to.be(false)
          done();
        }, 150);
      });
    });

    describe('2.2.2.3: it must not be called more than once.', function() {
      specify('already-fulfilled', function(done) {
        var timesCalled = 0;

        Promise.resolved(dummy).then(function onFulfilled() {
          expect(++timesCalled).to.be.equal(1);
          done();
        });
      });

      specify('trying to fulfill a pending promise more than once, immediately', function(done) {
        var d = Promise.deferred(),
            timesCalled = 0;

        d.promise.then(function onFulfilled() {
          expect(++timesCalled).to.be.equal(1);
          done();
        });

        d.resolve(dummy);
        d.resolve(dummy);
      });

      specify('trying to fulfill a pending promise more than once, delayed', function(done) {
        var d = Promise.deferred(),
            timesCalled = 0;

        d.promise.then(function onFulfilled() {
          expect(++timesCalled).to.be.equal(1);
          done();
        });

        setTimeout(function() {
          d.resolve(dummy);
          d.resolve(dummy);
        }, 50);
      });

      specify('trying to fulfill a pending promise more than once, immediately then delayed', function(done) {
        var d = Promise.deferred(),
            timesCalled = 0;

        d.promise.then(function onFulfilled() {
          expect(++timesCalled).to.be.equal(1);
          done();
        });

        d.resolve(dummy);

        setTimeout(function() {
          d.resolve(dummy);
        }, 50);
      });

      specify('when multiple `then` calls are made, spaced apart in time', function(done) {
        var d = Promise.deferred(),
            timesCalled = [0, 0, 0];

        d.promise.then(function onFulfilled() {
          expect(++timesCalled[0]).to.be.equal(1);
        });

        setTimeout(function() {
          d.promise.then(function onFulfilled() {
            expect(++timesCalled[1]).to.be.equal(1);
          });
        }, 50);

        setTimeout(function() {
          d.promise.then(function onFulfilled() {
            expect(++timesCalled[2]).to.be.equal(1);
            done();
          });
        }, 100);

        setTimeout(function() {
          d.resolve(dummy);
        }, 150);
      });

      specify('when `then` is interleaved with fulfillment', function(done) {
        var d = Promise.deferred(),
            timesCalled = [0, 0];

        d.promise.then(function onFulfilled() {
          expect(++timesCalled[0]).to.be.equal(1);
        });

        d.resolve(dummy);

        d.promise.then(function onFulfilled() {
          expect(++timesCalled[1]).to.be.equal(1);
          done();
        });
      });
    });
  });

});
