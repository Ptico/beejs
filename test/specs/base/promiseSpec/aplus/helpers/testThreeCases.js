define(['base/promise'], function(Promise) {
  'use strict';

  var testThreeCases = {};

  testThreeCases.testFulfilled = function(value, test) {
    specify('already-fulfilled', function(done) {
      test(Promise.resolved(value), done);
    });

    specify('immediately-fulfilled', function(done) {
      var d = Promise.deferred();

      test(d.promise, done);

      d.resolve(value);
    });

    specify('eventually-fulfilled', function(done) {
      var d = Promise.deferred();

      test(d.promise, done);

      setTimeout(function() {
        d.resolve(value);
      }, 50);
    });
  };

  testThreeCases.testRejected = function(reason, test) {
    specify('already-rejected', function(done) {
      test(Promise.rejected(reason), done);
    });

    specify('immediately-rejected', function(done) {
      var d = Promise.deferred();

      test(d.promise, done);

      d.reject(reason);
    });

    specify('eventually-rejected', function(done) {
      var d = Promise.deferred();

      test(d.promise, done);

      setTimeout(function() {
        d.reject(reason);
      }, 50);
    });
  };

  return testThreeCases;
});