define(function(require) {
  'use strict';

  var Promise = require('base/promise'),
      helpers = require('spec/base/promiseSpec/aplus/helpers/testThreeCases'),
      reasons = require('spec/base/promiseSpec/aplus/helpers/reasons'),
      testFulfilled = helpers.testFulfilled,
      testRejected  = helpers.testRejected,
      dummy    = { dummy: 'dummy' },
      other    = { other: 'other' },
      sentinel = { sentinel: 'sentinel' };

  describe('2.2.7: `then` must return a promise: `promise2 = promise1.then(onFulfilled, onRejected)`', function() {
    specify('is a promise', function() {
      var promise1 = Promise.deferred().promise,
          promise2 = promise1.then();

      expect(typeof promise2 === 'object' || typeof promise2 === 'function').to.be.ok();
      // expect(promise2).to.be.eql(null); - TODO - wtf?
      expect(promise2.then).to.be.a('function');
    });

    describe('2.2.7.1: If either `onFulfilled` or `onRejected` returns a value `x`, run the Promise Resolution ' +
             'Procedure `[[Resolve]](promise2, x)`', function() {

      specify('see separate 3.3 tests', function() { });
    });

    describe('2.2.7.2: If either `onFulfilled` or `onRejected` throws an exception `e`, `promise2` must be rejected ' +
             'with `e` as the reason.', function() {

      function testReason(expectedReason, stringRepresentation) {
        describe('The reason is ' + stringRepresentation, function() {
          testFulfilled(dummy, function(promise1, done) {
            var promise2 = promise1.then(function onFulfilled() {
              throw expectedReason;
            });

            promise2.then(null, function onPromise2Rejected(actualReason) {
              expect(actualReason).to.be.equal(expectedReason);
              done();
            });
          });

          testRejected(dummy, function(promise1, done) {
            var promise2 = promise1.then(null, function onRejected() {
              throw expectedReason;
            });

            promise2.then(null, function onPromise2Rejected(actualReason) {
              expect(actualReason).to.be.equal(expectedReason);
              done();
            });
          });
        });
      }

      Object.keys(reasons).forEach(function(stringRepresentation) {
        testReason(reasons[stringRepresentation], stringRepresentation);
      });
    });

    describe('2.2.7.3: If `onFulfilled` is not a function and `promise1` is fulfilled, `promise2` must be fulfilled ' +
             'with the same value.', function() {

      function testNonFunction(nonFunction, stringRepresentation) {
        describe('`onFulfilled` is ' + stringRepresentation, function() {
          testFulfilled(sentinel, function(promise1, done) {
            var promise2 = promise1.then(nonFunction);

            promise2.then(function onPromise2Fulfilled(value) {
              expect(value).to.be.equal(sentinel)
              done();
            });
          });
        });
      }

      testNonFunction(undefined, '`undefined`');
      testNonFunction(null, '`null`');
      testNonFunction(false, '`false`');
      testNonFunction(5, '`5`');
      testNonFunction({}, 'an object');
      testNonFunction([function() { return other; }], 'an array containing a function');
    });

    describe('2.2.7.4: If `onRejected` is not a function and `promise1` is rejected, `promise2` must be rejected ' +
             'with the same reason.', function() {

      function testNonFunction(nonFunction, stringRepresentation) {
        describe('`onRejected` is ' + stringRepresentation, function() {
          testRejected(sentinel, function(promise1, done) {
            var promise2 = promise1.then(null, nonFunction);

            promise2.then(null, function onPromise2Rejected(reason) {
              expect(reason).to.be.equal(sentinel);
              done();
            });
          });
        });
      }

      testNonFunction(undefined, '`undefined`');
      testNonFunction(null, '`null`');
      testNonFunction(false, '`false`');
      testNonFunction(5, '`5`');
      testNonFunction({}, 'an object');
      testNonFunction([function() { return other; }], 'an array containing a function');
    });
  });

});
