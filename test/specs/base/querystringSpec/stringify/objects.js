define(['base/querystring'], function(QueryString) {
  'use strict';

  describe('QueryString.stringify', function() {

    describe('Objects', function() {
      var obj = { a: { b: 1, c: 2 }, c: { d: '3' } };

      it('should add object keys', function() {
        var result = QueryString.stringify(obj, { escape: false });

        expect(result).to.be.eql('a[b]=1&a[c]=2&c[d]=3');
      });
    });

  });

});