define(function(require) {
  'use strict';

  var Promise = require('base/promise'),
      helpers = require('spec/base/promiseSpec/aplus/helpers/testThreeCases'),
      testFulfilled = helpers.testFulfilled,
      testRejected  = helpers.testRejected,
      dummy = { dummy: 'dummy' };

  describe('2.3.4: If `x` is not an object or function, fulfill `promise` with `x`', function() {

    function testValue(expectedValue, stringRepresentation, beforeEachHook, afterEachHook) {
      describe('The value is ' + stringRepresentation, function() {
        if (typeof beforeEachHook === 'function') {
          beforeEach(beforeEachHook);
        }

        if (typeof afterEachHook === 'function') {
          afterEach(afterEachHook);
        }

        testFulfilled(dummy, function(promise1, done) {
          var promise2 = promise1.then(function onFulfilled() {
            return expectedValue;
          });

          promise2.then(function onPromise2Fulfilled(actualValue) {
            expect(actualValue).to.be.equal(expectedValue);
            done();
          });
        });

        testRejected(dummy, function(promise1, done) {
          var promise2 = promise1.then(null, function onRejected() {
            return expectedValue;
          });

          promise2.then(function onPromise2Fulfilled(actualValue) {
            expect(actualValue).to.be.equal(expectedValue);
            done();
          });
        });
      });
    }

    testValue(undefined, '`undefined`');
    testValue(null, '`null`');
    testValue(false, '`false`');
    testValue(true, '`true`');
    testValue(0, '`0`');

    testValue(
      true,
      '`true` with `Boolean.prototype` modified to have a `then` method',
      function() {
        Boolean.prototype.then = function() {};
      },
      function() {
        delete Boolean.prototype.then;
      }
    );

    testValue(
      1,
      '`1` with `Number.prototype` modified to have a `then` method',
      function() {
        Number.prototype.then = function() {};
      },
      function() {
        delete Number.prototype.then;
      }
    );
  });

});
