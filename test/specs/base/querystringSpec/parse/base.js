define(['base/querystring', 'fixtures/qsFixtures'], function(QueryString, fixtures) {
  'use strict';

  describe('QueryString.parse', function() {

    describe('Base', function() {
      var examples = fixtures.base;

      it('should parse simple key-values', function() {
        for (var str in examples) {
          expect(QueryString.parse(str)).to.be.eql(examples[str]);
        }
      });

    });

  });
});