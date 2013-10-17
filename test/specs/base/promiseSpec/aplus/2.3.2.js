define(function(require) {
  'use strict';

  var Promise  = require('base/promise'),
      dummy    = { dummy: 'dummy' },
      sentinel = { sentinel: 'sentinel' };

  function testPromiseResolution(xFactory, test) {
    specify('via return from a fulfilled promise', function(done) {
      var promise = Promise.resolved(dummy).then(function onBasePromiseFulfilled() {
        return xFactory();
      });

      test(promise, done);
    });

    specify('via return from a rejected promise', function(done) {
      var promise = Promise.rejected(dummy).then(null, function onBasePromiseRejected() {
        return xFactory();
      });

      test(promise, done);
    });
  }

  describe('2.3.2: If `x` is a promise, adopt its state', function() {

    describe('2.3.2.1: If `x` is pending, `promise` must remain pending until `x` is fulfilled or rejected.',
             function() {

      function xFactory() {
        return Promise.deferred().promise;
      }

      testPromiseResolution(xFactory, function(promise, done) {
        var wasFulfilled = false,
            wasRejected  = false;

        promise.then(
          function onPromiseFulfilled() {
            wasFulfilled = true;
          },
          function onPromiseRejected() {
            wasRejected = true;
          }
        );

        setTimeout(function() {
          expect(wasFulfilled).to.be(false);
          expect(wasRejected).to.be(false);
          done();
        }, 100);
      });
    });

    describe('2.3.2.2: If/when `x` is fulfilled, fulfill `promise` with the same value.', function() {
      describe('`x` is already-fulfilled', function() {
        function xFactory() {
          return Promise.resolved(sentinel);
        }

        testPromiseResolution(xFactory, function(promise, done) {
          promise.then(function onPromiseFulfilled(value) {
            expect(value).to.be.equal(sentinel);
            done();
          });
        });
      });

      describe('`x` is eventually-fulfilled', function() {
        var d = null;

        function xFactory() {
          d = Promise.deferred();

          setTimeout(function() {
            d.resolve(sentinel);
          }, 50);

          return d.promise;
        }

        testPromiseResolution(xFactory, function(promise, done) {
          promise.then(function onPromiseFulfilled(value) {
            expect(value).to.be.equal(sentinel)
            done();
          });
        });
      });
    });

    describe('2.3.2.3: If/when `x` is rejected, reject `promise` with the same reason.', function() {
      describe('`x` is already-rejected', function() {
        function xFactory() {
          return Promise.rejected(sentinel);
        }

        testPromiseResolution(xFactory, function(promise, done) {
          promise.then(null, function onPromiseRejected(reason) {
            expect(reason).to.be.equal(sentinel);
            done();
          });
        });
      });

      describe('`x` is eventually-rejected', function() {
        var d = null;

        function xFactory() {
          d = Promise.deferred();

          setTimeout(function() {
            d.reject(sentinel);
          }, 50);

          return d.promise;
        }

        testPromiseResolution(xFactory, function(promise, done) {
          promise.then(null, function onPromiseRejected(reason) {
            expect(reason).to.be.equal(sentinel);
            done();
          });
        });
      });
    });
  });

});
