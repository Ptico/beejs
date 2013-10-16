define(['base/util'], function(util) {
  describe('Utils', function() {

    describe('deepMerge', function() {
      it('should deeply merge two objects', function() {
        var a = { a: 1, obj: { a: 'bar', b: [3, 4], c: 'foo' }, arr: [2, { c: 'baz' } ] },
            b = { b: 2, obj: { c: 'baz', b: [5] }, arr: [3, { d: 'foo' }] },
            result = util.deepMerge(a, b);

        expect(result.a).to.be.eql(1);
        expect(result.b).to.be.eql(2);
        expect(result.obj).to.be.eql({ a: 'bar', b: [3, 4, 5], c: 'baz' });
        expect(result.arr).to.be.eql([2, { c: 'baz', d: 'foo' }, 3]);
      });

      it('should merge object into array', function() {
        var a = [1, 2, 3],
            b = { a: 'b' },
            result = util.deepMerge(a, b);

        expect(result).to.be.eql({0: 1, 1: 2, 2: 3, a: 'b'});
      });
    });

  });
});
