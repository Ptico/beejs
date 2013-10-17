define(function(require) {
  'use strict';

  var Promise = require('base/promise'),
      dummy = { dummy: 'dummy' };

  describe('2.2.1: Both `onFulfilled` and `onRejected` are optional arguments.', function () {
    describe('2.2.1.1: If `onFulfilled` is not a function, it must be ignored.', function () {
      function testNonFunction(nonFunction, stringRepresentation) {
        specify('`onFulfilled` is ' + stringRepresentation, function(done) {
          Promise.rejected(dummy).then(nonFunction, function() {
            done();
          });
        });
      }

      testNonFunction(undefined, '`undefined`');
      testNonFunction(null, '`null`');
      testNonFunction(false, '`false`');
      testNonFunction(5, '`5`');
      testNonFunction({}, 'an object');
    });

    describe('2.2.1.2: If `onRejected` is not a function, it must be ignored.', function() {
      function testNonFunction(nonFunction, stringRepresentation) {
        specify('`onRejected` is ' + stringRepresentation, function(done) {
          Promise.resolved(dummy).then(function() {
            done();
          }, nonFunction);
        });
      }

      testNonFunction(undefined, '`undefined`');
      testNonFunction(null, '`null`');
      testNonFunction(false, '`false`');
      testNonFunction(5, '`5`');
      testNonFunction({}, 'an object');
    });
  });

});
