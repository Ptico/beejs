define("base/uri", [], function() {
  /* URI Regexp
    /^
      (?:
        (?:([\w.+-]+):)? # Protocol
      \/\/)?
      (?:
        ([^:@]*) # Username
        (?::([^:@]*))? # Password
      @)?
      ([^:\/?#]+)? # Domain
      (?::(\d*))? # Port
      (\/[^?#]*)? # Path
      (?:\?([^#]*))? # Query string
      (#.*)? # Hash
    $/
  */
  var uriReg = /^(?:(?:([\w.+\-]+):)?\/\/)?(?:([^:@]*)(?::([^:@]*))?@)?([^:\/?#]+)?(?::(\d*))?(\/[^?#]*)?(?:\?([^#]*))?(#.*)?$/;

  function URI(URIString) {
    var parts = URIString.match(uriReg);

    this._protocol = parts[1];
    this._username = parts[2];
    this._password = parts[3];
    this._port     = parts[5];
    this._path     = parts[6];
    this._query    = parts[7];
    this._hash     = parts[8];

    this._splitHostname(parts[4]);
  }

  URI.prototype = {
    protocol: function(val) {
      if (val) {
        this._protocol = val;
        return this;
      } else {
        return this._protocol;
      }
    },

    username: function(val) {
      if (val) {
        this._username = val;
        return this;
      } else {
        return this._username;
      }
    },

    password: function(val) {
      if (val) {
        this._password = val;
        return this;
      } else {
        return this._password;
      }
    },

    hostname: function(val) {
      if (val) {
        this._splitHostname(val);
        return this;
      } else {
        return [this._domain, this._tld].join('.');
      }
    },

    tld: function(val) {
      if (val) {
        this._tld = val;
        return this;
      } else {
        return this._tld;
      }
    },

    port: function(val) {
      if (val) {
        this._port = val;
        return this;
      } else {
        return this._port;
      }
    },

    path: function(val) {
      if (val) {
        this._path = val;
        return this;
      } else {
        return this._path;
      }
    },

    query: function(val) {
      if (val) {
        this._query = val;
        return this;
      } else {
        return this._query;
      }
    },

    hash: function(val) {
      if (val) {
        this._hash = val;
        return this;
      } else {
        return this._hash;
      }
    },

    // Private
    _splitHostname: function(hostname) {
      var parts = hostname.split('.');

      this._tld    = parts.splice(-1, 1)[0];
      this._domain = parts;
    }
  };

  return URI;
});