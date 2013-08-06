define(['base/querystring'], function(QueryString) {
  describe('Stringify', function() {
    describe('Simple types', function() {
      it('should stringify simple params', function() {
        var obj = { a: 1, b: 'foo', c: false };

        expect(QueryString.stringify(obj)).to.be.eql('a=1&b=foo&c=false');
      });
    });

    describe('Date type', function() {
      var obj = { created_at: new Date('10 May 1986 00:55:00 GMT+0200') };

      it('should be a unix-timestamp by default', function() {
        var result = QueryString.stringify(obj);

        expect(result).to.be.eql('created_at=516063300000');
      });

      it('can be a formatted string', function() {
        var result = QueryString.stringify(obj, { timeFormat: '%d %m' });

        expect(result).to.be.eql('created_at=10%2005');
      });
    });

    describe('Arrays', function() {
      var obj = { a: [1, 2], b: [ '3', '4'] };

      it('should stringify arrays with [] key and without index by default', function() {
        var result = QueryString.stringify(obj);

        expect(result).to.be.eql('a[]=1&a[]=2&b[]=3&b[]=4');
      });

      it('can add index to key', function() {
        var result = QueryString.stringify(obj, { keyIndex: true });

        expect(result).to.be.eql('a[0]=1&a[1]=2&b[0]=3&b[1]=4');
      });

      it('can create old-style array', function() {
        var result = QueryString.stringify(obj, { keys: false });

        expect(result).to.be.eql('a=1&a=2&b=3&b=4');
      });
    });

    describe('Objects', function() {
      var obj = { a: { b: 1, c: 2 }, c: { d: '3' } };

      it('should add object keys', function() {
        var result = QueryString.stringify(obj);

        expect(result).to.be.eql('a[b]=1&a[c]=2&c[d]=3');
      });
    });

    describe('Complex object', function() {
      var obj = { a: 1, b: ['1', [5, {f: false, s: '7'}], 3], c: false, d: {a: 1, b: 2} };

      it('should generate proper string with defaults', function() {
        var result = QueryString.stringify(obj);

        expect(result).to.be.eql('a=1&b[]=1&b[][]=5&b[][][f]=false&b[][][s]=7&b[]=3&c=false&d[a]=1&d[b]=2');
      });

      it('can generate proper string with indices', function() {
        var result = QueryString.stringify(obj, { keyIndex: true });

        expect(result).to.be.eql('a=1&b[0]=1&b[1][0]=5&b[1][1][f]=false&b[1][1][s]=7&b[2]=3&c=false&d[a]=1&d[b]=2');
      });
    });
  });
});