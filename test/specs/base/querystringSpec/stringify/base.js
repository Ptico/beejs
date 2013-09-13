define(['base/querystring', 'fixtures/qsFixtures'], function(QueryString, fixtures) {
  'use strict';

  describe('QueryString.stringify', function() {

    describe('Base', function() {
      var examples = fixtures.base,
          dateObj  = { created_at: new Date('10 May 1986 00:55:00 GMT+0200') };

      it('should stringify simple key-values', function() {
        for (var str in examples) {
          expect(QueryString.stringify(examples[str], { escape: false })).to.be.eql(str);
        }
      });

      it('should stringify date as unix-timestamp by default', function() {
        var result = QueryString.stringify(dateObj);

        expect(result).to.be.eql('created_at=516063300000');
      });

      it('can stringify to formatted string', function() {
        var result = QueryString.stringify(dateObj, { timeFormat: '%m %Y', escape: false });

        expect(result).to.be.eql('created_at=05 1986');
      });

    });

  });
});