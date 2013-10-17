define(function(require) {
  'use strict';

  var Promise = require('base/promise'),
      dummy = { dummy: 'dummy' };

  describe('2.3.1: If `promise` and `x` refer to the same object, reject `promise` with a `TypeError` as the reason.',
           function() {

    specify('via return from a fulfilled promise', function(done) {
      var promise = Promise.resolved(dummy).then(function() {
        return promise;
      });

      promise.then(null, function(reason) {
        expect(reason).to.be.a(TypeError);
        done();
      });
    });

    specify('via return from a rejected promise', function(done) {
      var promise = Promise.rejected(dummy).then(null, function() {
        return promise;
      });

      promise.then(null, function(reason) {
        expect(reason).to.be.a(TypeError);
        done();
      });
    });
  });

});
