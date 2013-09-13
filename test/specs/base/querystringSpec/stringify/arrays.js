define(['base/querystring'], function(QueryString) {
  'use strict';

  describe('QueryString.stringify', function() {

    describe('Arrays', function() {
      var obj = { a: [1, 2], b: [ '3', '4'] };

      it('should stringify arrays with [] key and with index by default', function() {
        var result = QueryString.stringify(obj, { escape: false });

        expect(result).to.be.eql('a[0]=1&a[1]=2&b[0]=3&b[1]=4');
      });

      it('can work without index', function() {
        var result = QueryString.stringify(obj, { keyIndex: false, escape: false });

        expect(result).to.be.eql('a[]=1&a[]=2&b[]=3&b[]=4');
      });

      it('should force index when have nested array', function() {
        var result = QueryString.stringify({ a: [ 1, [2, [3, 4], 5] ] }, { keyIndex: false, escape: false });

        expect(result).to.be.eql('a[0]=1&a[1][0]=2&a[1][1][]=3&a[1][1][]=4&a[1][2]=5');
      });

      it('can create old-style array', function() {
        var result = QueryString.stringify(obj, { brackets: false });

        expect(result).to.be.eql('a=1&a=2&b=3&b=4');
      });
    });

  });

});