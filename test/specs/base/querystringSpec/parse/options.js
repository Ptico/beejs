define(['base/querystring'], function(QueryString) {
  'use strict';

  describe('QueryString.parse', function() {

    describe('Options', function() {
      it('should parse object with defaults', function() {
        var result = QueryString.parse('a=1&b[0]=1&b[1][0]=5&b[1][1][f]=false&b[1][1][s]=7&b[2]=3&c=false&d[a]=1&d[b]=2');

        expect(result.a).to.be.eql(1);
        expect(result.b).to.be.eql([1, [5, {f: false, s: 7}], 3]);
      });

      it('should parse object with custom delimiter', function() {
        var str = 'a=1;b[0]=1;b[1][0]=5;b[1][1][f]=false;b[1][1][s]=7;b[2]=3;c=false;d[a]=1;d[b]=2',
            result = QueryString.parse(str, { delimiter: ';' });

        expect(result.a).to.be.eql(1);
        expect(result.b).to.be.eql([1, [5, {f: false, s: 7}], 3]);
      });

      it ('should parse object with custom key-value delimiter', function() {
        var str = 'a:1&b[0]:1&b[1][0]:5&b[1][1][f]:false&b[1][1][s]:7&b[2]:3&c:false&d[a]:1&d[b]:2',
            result = QueryString.parse(str, { eq: ':' });

        expect(result.a).to.be.eql(1);
        expect(result.b).to.be.eql([1, [5, {f: false, s: 7}], 3]);
      });
    });

  });

});