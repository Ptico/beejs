define(function(require) {
  'use strict';

  var Promise       = require('base/promise'),
      testFulfilled = require('spec/base/promiseSpec/aplus/helpers/testThreeCases').testFulfilled,
      dummy = { dummy: 'dummy' };

  describe('2.1.2.1: When fulfilled, a promise: must not transition to any other state.', function () {
    testFulfilled(dummy, function(promise, done) {
      var onFulfilledCalled = false;

      promise.then(function onFulfilled() {
        onFulfilledCalled = true;
      }, function onRejected() {
        expect(onFulfilledCalled).to.be(false);
        done();
      });

      setTimeout(done, 100);
    });

    specify('trying to fulfill then immediately reject', function (done) {
      var d = Promise.deferred(),
          onFulfilledCalled = false;

      d.promise.then(function onFulfilled() {
        onFulfilledCalled = true;
      }, function onRejected() {
        expect(onFulfilledCalled).to.be(false);
        done();
      });

      d.resolve(dummy);
      d.reject(dummy);

      setTimeout(done, 100);
    });

    specify('trying to fulfill then reject, delayed', function (done) {
      var d = Promise.deferred(),
          onFulfilledCalled = false;

      d.promise.then(function onFulfilled() {
        onFulfilledCalled = true;
      }, function onRejected() {
        expect(onFulfilledCalled).to.be(false);
        done();
      });

      setTimeout(function () {
        d.resolve(dummy);
        d.reject(dummy);
      }, 50);

      setTimeout(done, 100);
    });

    specify('trying to fulfill immediately then reject delayed', function (done) {
      var d = Promise.deferred(),
          onFulfilledCalled = false;

      d.promise.then(function onFulfilled() {
        onFulfilledCalled = true;
      }, function onRejected() {
        expect(onFulfilledCalled).to.be(false);
        done();
      });

      d.resolve(dummy);

      setTimeout(function () {
        d.reject(dummy);
      }, 50);

      setTimeout(done, 100);
    });
  });

});
