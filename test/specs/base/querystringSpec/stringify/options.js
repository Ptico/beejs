define(['base/querystring'], function(QueryString) {
  'use strict';

  describe('QueryString.stringify', function() {

    describe('Options', function() {
      var obj = { a: 1, b: ['1', [5, {f: false, s: '7'}], 3], c: false, d: {a: 1, b: 2} };

      it('can generate proper string with defaults', function() {
        var result = QueryString.stringify(obj);

        expect(result).to.be.eql('a=1&b%5B0%5D=1&b%5B1%5D%5B0%5D=5&b%5B1%5D%5B1%5D%5Bf%5D=false&b%5B1%5D%5B1%5D%5Bs%5D=7&b%5B2%5D=3&c=false&d%5Ba%5D=1&d%5Bb%5D=2');
      });

      it('can generate unescaped string', function() {
        var result = QueryString.stringify(obj, { escape: false });

        expect(result).to.be.eql('a=1&b[0]=1&b[1][0]=5&b[1][1][f]=false&b[1][1][s]=7&b[2]=3&c=false&d[a]=1&d[b]=2');
      });

      it('can generate string with custom delimiter', function() {
        var result = QueryString.stringify(obj, { delimiter: ';', escape: false });

        expect(result).to.be.eql('a=1;b[0]=1;b[1][0]=5;b[1][1][f]=false;b[1][1][s]=7;b[2]=3;c=false;d[a]=1;d[b]=2');
      });

      it('can generate string with custom key-value delimiter', function() {
        var result = QueryString.stringify(obj, { eq: ':', escape: false });

        expect(result).to.be.eql('a:1&b[0]:1&b[1][0]:5&b[1][1][f]:false&b[1][1][s]:7&b[2]:3&c:false&d[a]:1&d[b]:2');
      });
    });

  });

});