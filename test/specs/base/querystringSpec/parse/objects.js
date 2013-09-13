define(['base/querystring'], function(QueryString) {
  'use strict';

  describe('QueryString.parse', function() {

    describe('Objects', function() {
      it('should parse objects with keys', function() {
        var result = QueryString.parse('obj[a]=1&obj[b]=2');

        expect(result.obj).to.be.eql({ a: 1, b: 2 });
      });

      it('should parse nested objects', function() {
        var result = QueryString.parse('obj[a][a]=1&obj[a][b]=2');

        expect(result.obj.a).to.be.eql({ a: 1, b: 2 });
      });

      it('should parse objects with array value', function() {
        var result = QueryString.parse('obj[a][]=1&obj[a][]=2&obj[b]=3');

        expect(result.obj.a).to.be.an('array');
        expect(result.obj).to.be.eql({ a: [1, 2], b: 3 })
      });
    });

  });

});