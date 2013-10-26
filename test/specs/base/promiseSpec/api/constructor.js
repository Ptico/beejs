define(['base/promise'], function(Promise) {
  'use strict';

  var dummy    = { dummy: 'dummy' },
      sentinel = { sentinel: 'sentinel' };

  describe('Constructor', function() {
    it('Resolver function fulfill', function(done) {
      var promise = new Promise(function(resolve) {
        resolve(dummy);
      });

      promise.then(function(value) {
        expect(value).to.be.equal(dummy);
        return sentinel;
      }).then(function(value) {
        expect(value).to.be.equal(sentinel);
        done();
      });
    });

    it('Resolver function reject', function(done) {
      var promise = new Promise(function(resolve, reject) {
        reject(dummy);
      });

      promise.then(null, function(reason) {
        expect(reason).to.be.equal(dummy);
        done();
      });
    });
  });

});
