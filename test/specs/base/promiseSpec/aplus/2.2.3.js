define(function(require) {
  'use strict';

  var Promise      = require('base/promise'),
      testRejected = require('spec/base/promiseSpec/aplus/helpers/testThreeCases').testRejected,
      dummy    = { dummy: 'dummy' },
      sentinel = { sentinel: 'sentinel' };

  describe('2.2.3: If `onRejected` is a function,', function() {

    describe('2.2.3.1: it must be called after `promise` is rejected, with `promise`’s rejection reason as its ' +
             'first argument.', function() {

      testRejected(sentinel, function(promise, done) {
        promise.then(null, function onRejected(reason) {
          expect(reason).to.be.equal(sentinel);
          done();
        });
      });
    });

    describe('2.2.3.2: it must not be called before `promise` is rejected', function() {
      specify('rejected after a delay', function(done) {
        var d = Promise.deferred(),
            isRejected = false;

        d.promise.then(null, function onRejected() {
          expect(isRejected).to.be(true);
          done();
        });

        setTimeout(function() {
          d.reject(dummy);
          isRejected = true;
        }, 50);
      });

      specify('never rejected', function(done) {
        var d = Promise.deferred(),
            onRejectedCalled = false;

        d.promise.then(null, function onRejected() {
          onRejectedCalled = true;
          done();
        });

        setTimeout(function() {
          expect(onRejectedCalled).to.be(false);
          done();
        }, 150);
      });
    });

    describe('2.2.3.3: it must not be called more than once.', function() {
      specify('already-rejected', function (done) {
        var timesCalled = 0;

        Promise.rejected(dummy).then(null, function onRejected() {
          expect(++timesCalled).to.be.equal(1);
          done();
        });
      });

      specify('trying to reject a pending promise more than once, immediately', function(done) {
        var d = Promise.deferred(),
            timesCalled = 0;

        d.promise.then(null, function onRejected() {
          expect(++timesCalled).to.be.equal(1);
          done();
        });

        d.reject(dummy);
        d.reject(dummy);
      });

      specify('trying to reject a pending promise more than once, delayed', function(done) {
        var d = Promise.deferred(),
            timesCalled = 0;

        d.promise.then(null, function onRejected() {
          expect(++timesCalled).to.be.equal(1);
          done();
        });

        setTimeout(function() {
          d.reject(dummy);
          d.reject(dummy);
        }, 50);
      });

      specify('trying to reject a pending promise more than once, immediately then delayed', function(done) {
        var d = Promise.deferred(),
            timesCalled = 0;

        d.promise.then(null, function onRejected() {
          expect(++timesCalled).to.be.equal(1);
          done();
        });

        d.reject(dummy);

        setTimeout(function() {
          d.reject(dummy);
        }, 50);
      });

      specify('when multiple `then` calls are made, spaced apart in time', function(done) {
        var d = Promise.deferred(),
            timesCalled = [0, 0, 0];

        d.promise.then(null, function onRejected() {
          expect(++timesCalled[0]).to.be.equal(1);
        });

        setTimeout(function() {
          d.promise.then(null, function onRejected() {
            expect(++timesCalled[1]).to.be.equal(1);
          });
        }, 50);

        setTimeout(function() {
          d.promise.then(null, function onRejected() {
            expect(++timesCalled[2]).to.be.equal(1);
            done();
          });
        }, 100);

        setTimeout(function() {
          d.reject(dummy);
        }, 150);
      });

      specify('when `then` is interleaved with rejection', function(done) {
        var d = Promise.deferred(),
            timesCalled = [0, 0];

        d.promise.then(null, function onRejected() {
          expect(++timesCalled[0]).to.be.equal(1);
        });

        d.reject(dummy);

        d.promise.then(null, function onRejected() {
          expect(++timesCalled[1]).to.be.equal(1);
          done();
        });
      });
    });
  });

});
