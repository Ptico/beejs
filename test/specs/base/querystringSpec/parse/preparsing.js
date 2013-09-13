define(['base/querystring'], function(QueryString) {
  'use strict';

  describe('QueryString.parse', function() {

    describe('Preparsing', function() {
      it('should unescape string', function() {
        var result = QueryString.parse('a=b%20c&b=%E2%9C%93&c%5B0%5D=1&c%5B1%5D=2');

        expect(result).to.be.eql({ a: 'b c', b: '✓', c: [1, 2]});
      });

      it('should replace `+` sign to space', function() {
        var result = QueryString.parse('a=b+c');

        expect(result.a).to.be.eql('b c');
      });

      it('should normalize spaces inside object brackets', function() {
        var result = QueryString.parse('a[ ]=2&a%5B%20%5D=3');

        expect(result).to.be.eql({ a: [2, 3] });
      });
    });

  });

});