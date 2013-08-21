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
        var result = QueryString.stringify(obj, { timeFormat: '%m %Y', escape: false });

        expect(result).to.be.eql('created_at=05 1986');
      });
    });

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

    describe('Objects', function() {
      var obj = { a: { b: 1, c: 2 }, c: { d: '3' } };

      it('should add object keys', function() {
        var result = QueryString.stringify(obj, { escape: false });

        expect(result).to.be.eql('a[b]=1&a[c]=2&c[d]=3');
      });
    });

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

  describe('Parse', function() {
    describe('Basic parsing', function() {
      var examples = {
        'a=b': { a: 'b' },
        'a=b&b=2': { a: 'b', b: 2 },
        'a=':  { a: '' },
        'a=b=c': { a: 'b=c' },
        'a=b=c&c': { a: 'b=c', c: undefined }
      };

      it('should parse simple key-values', function() {
        for (var str in examples) {
          expect(QueryString.parse(str)).to.be.eql(examples[str]);
        }
      });
    });

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

    describe('Arrays', function() {
      it('should parse arrays when []', function() {
        var result = QueryString.parse('a[]=1&a[]=2&ab=3&a[]=5');

        expect(result.a).to.be.an('array');
        expect(result.a).to.be.eql([1, 2, 5]);
      });

      it('should parse array when indices', function() {
        var result = QueryString.parse('a[0]=1&a[1]=2&ab=3&a[2]=5');

        expect(result.a).to.be.an('array');
        expect(result.a).to.be.eql([1, 2, 5]);
      });

      it('should parse nested array', function() {
        var result = QueryString.parse('a[0]=1&a[1][]=2&a[1][]=3&ab=3&a[2]=5');

        expect(result.a).to.be.an('array');
        expect(result.a[1]).to.be.an('array');
        expect(result.a).to.be.eql([1, [2, 3], 5]);
      });

      it('should parse unsorted array', function() {
        var result = QueryString.parse('a[1]=2&a[0]=1&a[2]=3');

        expect(result.a).to.be.eql([1, 2, 3]);
      });
    });

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

    describe('Options', function() {
      it('should parse object with defaults', function() {
        var result = QueryString.parse('a=1&b[0]=1&b[1][0]=5&b[1][1][f]=false&b[1][1][s]=7&b[2]=3&c=false&d[a]=1&d[b]=2');

        expect(result.a).to.be.eql(1);
        expect(result.b).to.be.eql(['1', [5, {f: false, s: '7'}], 3]);
      });

      it('should parse object with custom delimiter', function() {
        var str = 'a=1;b[0]=1;b[1][0]=5;b[1][1][f]=false;b[1][1][s]=7;b[2]=3;c=false;d[a]=1;d[b]=2',
            result = QueryString.parse(str, { delimiter: ';' });

        expect(result.a).to.be.eql(1);
        expect(result.b).to.be.eql(['1', [5, {f: false, s: '7'}], 3]);
      });

      it ('should parse object with custom key-value delimiter', function() {
        var str = 'a:1&b[0]:1&b[1][0]:5&b[1][1][f]:false&b[1][1][s]:7&b[2]:3&c:false&d[a]:1&d[b]:2',
            result = QueryString.parse(str, { eq: ':' });

        expect(result.a).to.be.eql(1);
        expect(result.b).to.be.eql(['1', [5, {f: false, s: '7'}], 3]);
      });
    });

  });
});