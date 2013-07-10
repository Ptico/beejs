define(["base/uri"], function(URI) {
  describe("URI", function() {
    describe("Parser", function() {
      var uri;

      beforeEach(function() {
        uri = new URI("http://paul:secret@example.aero:1234/foo-bar/baz.html?a=1&b=b#hello");
      });

      it('should parse protocol', function() {
        expect(uri.protocol()).to.be.eql('http');
      });

      it('should parse user', function() {
        expect(uri.username()).to.be.eql('paul');
      });

      it('should parse password', function() {
        expect(uri.password()).to.be.eql('secret');
      });

      it('should parse hostname', function() {
        expect(uri.hostname()).to.be.eql('example.aero');
      });

      it('should parse tld', function() {
        expect(uri.tld()).to.be.eql('aero');
      });

      it('should parse port', function() {
        expect(uri.port()).to.be.eql('1234');
      });

      it('should parse path', function() {
        expect(uri.path()).to.be.eql('/foo-bar/baz.html');
      });

      it('should parse query string', function() {
        expect(uri.query()).to.be.eql('a=1&b=b');
      });

      it('should parse hash', function() {
        expect(uri.hash()).to.be.eql('#hello');
      });
    });

  });
});
