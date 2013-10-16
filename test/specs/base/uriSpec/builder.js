define(['base/uri'], function(URI) {
  describe('URI', function() {

    describe('Builder', function() {
      context('From scratch', function() {
        var uri;

        beforeEach(function() {
          uri = new URI();
        });

        it('should assign protocol', function() {
          uri.protocol = 'https';

          expect(uri.protocol).to.be.eql('https');
          expect(uri.toString()).to.be.eql('https://');
        });

        it('should assign user', function() {
          uri.user = 'root';

          expect(uri.user).to.be.eql('root');
          //expect(uri.username).to.be.eql('root');
          expect(uri.toString()).to.be.eql('root@');
        });

        it('should assign password', function() {
          uri.password = 'secret';

          expect(uri.password).to.be.eql('secret');
        });

        it('should assign userinfo', function() {
          uri.userinfo = 'root:secret';

          expect(uri.user).to.be.eql('root');
          expect(uri.password).to.be.eql('secret');
          expect(uri.userinfo).to.be.eql('root:secret');
        });

        it('should assign hostname', function() {
          uri.host = 'example.org';

          expect(uri.host).to.be.eql('example.org');
          //expect(uri.hostname).to.be.eql('example.org');
          expect(uri.toString()).to.be.eql('example.org');
        });

        it('should assign tld', function() {
          uri.tld = '.com';

          expect(uri.tld).to.be.eql('.com');
        });

        it('should assign port', function() {
          uri.port = 3000;

          expect(uri.port).to.be.eql(3000);
        });

        it('should assign path', function() {
          uri.path = '/foo.html';

          expect(uri.path).to.be.eql('/foo.html');
          expect(uri.toString()).to.be.eql('/foo.html');
        });

        it('should assign query', function() {
          uri.query = 'a=b c';

          expect(uri.query).to.be.eql('a=b%20c');
        });

        it('should assign fragment', function() {
          uri.fragment = 'foo';

          expect(uri.fragment).to.be.eql('foo');
          expect(uri.hash).to.be.eql('#foo');
        });

        it('should assign hash', function() {
          uri.hash = '#foo';

          expect(uri.fragment).to.be.eql('foo');
          expect(uri.hash).to.be.eql('#foo');
        });

        it('should have chaining methods', function() {
          uri.setProtocol('https').setUser('root').setPassword('secret').setHost('example.org').setPort(8080);
          uri.setPath('/foo.html').setQuery('a=b c').setHash('#bar');

          expect(uri.toString()).to.be.eql('https://root:secret@example.org:8080/foo.html?a=b%20c#bar');

          uri.setUserInfo('guest:guest').setTld('com').setFragment('baz');

          expect(uri.toString()).to.be.eql('https://guest:guest@example.com:8080/foo.html?a=b%20c#baz');
        });
      });

      context('From existing URI', function() {
        var uri;

        beforeEach(function() {
          uri = new URI('http://paul:secret@example.aero:1234/foo-bar/baz.html?a=1&b=b#hello');
        });

        it('should assign protocol', function() {
          uri.protocol = 'https';

          expect(uri.protocol).to.be.eql('https');
          expect(uri.toString()).to.be.eql('https://paul:secret@example.aero:1234/foo-bar/baz.html?a=1&b=b#hello');
        });

        it('should assign user', function() {
          uri.user = 'root';

          expect(uri.user).to.be.eql('root');
          expect(uri.toString()).to.be.eql('http://root:secret@example.aero:1234/foo-bar/baz.html?a=1&b=b#hello');
        });

        it('should assign password', function() {
          uri.password = 'admin';

          expect(uri.password).to.be.eql('admin');
          expect(uri.toString()).to.be.eql('http://paul:admin@example.aero:1234/foo-bar/baz.html?a=1&b=b#hello');
        });

        it('should assign userinfo', function() {
          uri.userinfo = 'root:admin';

          expect(uri.user).to.be.eql('root');
          expect(uri.password).to.be.eql('admin');
          expect(uri.userinfo).to.be.eql('root:admin');
          expect(uri.toString()).to.be.eql('http://root:admin@example.aero:1234/foo-bar/baz.html?a=1&b=b#hello');
        });

        it('should assign hostname', function() {
          uri.host = 'foo.org';

          expect(uri.host).to.be.eql('foo.org');
          expect(uri.toString()).to.be.eql('http://paul:secret@foo.org:1234/foo-bar/baz.html?a=1&b=b#hello');
        });

        it('should assign tld', function() {
          uri.tld = 'com';

          expect(uri.tld).to.be.eql('com');
          expect(uri.toString()).to.be.eql('http://paul:secret@example.com:1234/foo-bar/baz.html?a=1&b=b#hello');
        });

        it('should assign port', function() {
          uri.port = 3000;

          expect(uri.port).to.be.eql(3000);
          expect(uri.toString()).to.be.eql('http://paul:secret@example.aero:3000/foo-bar/baz.html?a=1&b=b#hello');
        });

        it('should assign path', function() {
          uri.path = '/foo.html';

          expect(uri.path).to.be.eql('/foo.html');
          expect(uri.toString()).to.be.eql('http://paul:secret@example.aero:1234/foo.html?a=1&b=b#hello');
        });

        it('should assign query', function() {
          uri.query = 'a=b c';

          expect(uri.query).to.be.eql('a=b%20c');
          expect(uri.toString()).to.be.eql('http://paul:secret@example.aero:1234/foo-bar/baz.html?a=b%20c#hello');
        });

        it('should assign fragment', function() {
          uri.fragment = 'foo';

          expect(uri.fragment).to.be.eql('foo');
          expect(uri.hash).to.be.eql('#foo');
          expect(uri.toString()).to.be.eql('http://paul:secret@example.aero:1234/foo-bar/baz.html?a=1&b=b#foo');
        });

        it('should assign hash', function() {
          uri.hash = '#foo';

          expect(uri.fragment).to.be.eql('foo');
          expect(uri.hash).to.be.eql('#foo');
          expect(uri.toString()).to.be.eql('http://paul:secret@example.aero:1234/foo-bar/baz.html?a=1&b=b#foo');
        });

      });

    });

  });
});
