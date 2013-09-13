define(['base/querystring'], function(QueryString) {
  'use strict';

  describe('QueryString.parse', function() {

    describe('Arrays', function() {
      it('should parse arrays when []', function() {
        var result = QueryString.parse('a[]=1&a[]=2&ab=3&a[]=5');

        expect(result.a).to.be.an('array');
        expect(result.a).to.be.eql([1, 2, 5]);
      });

      it('should parse array when indices', function() {
        var result = QueryString.parse('a[0]=1&a[1]=2&ab=3&a[2]=5');

        expect(result.a).to.be.an('array');
        expect(result.a).to.be.eql([1, 2, 5]);
      });

      it('should parse nested array', function() {
        var result = QueryString.parse('a[0]=1&a[1][]=2&a[1][]=3&ab=3&a[2]=5');

        expect(result.a).to.be.an('array');
        expect(result.a[1]).to.be.an('array');
        expect(result.a).to.be.eql([1, [2, 3], 5]);
      });

      it('should parse unsorted array', function() {
        var result = QueryString.parse('a[1]=2&a[0]=1&a[2]=3');

        expect(result.a).to.be.eql([1, 2, 3]);
      });
    });

  });

});