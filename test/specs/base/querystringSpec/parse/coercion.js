define(['base/querystring'], function(QueryString) {
  'use strict';

  describe('QueryString.parse', function() {

    describe('Coercion', function() {
      var result;

      beforeEach(function() {
        var str = 'a=42&b=2.3&c=str&d=true&e=false';

        result = QueryString.parse(str);
      });

      it('should detect integers', function() {
        expect(result.a).to.be.equal(42);
      });

      it('should detect floats', function() {
        expect(result.b).to.be.equal(2.3);
      });

      it('should detect strings', function() {
        expect(result.c).to.be.equal('str');
      });

      it('should detect booleans', function() {
        expect(result.d).to.be(true);
        expect(result.e).to.be(false);
      });
    });

  });

});