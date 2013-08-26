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

    if (parts[1]) this._protocol = parts[1];
    if (parts[2]) this._username = parts[2];
    if (parts[3]) this._password = parts[3];
    if (parts[5]) this._port     = parts[5];
    if (parts[6]) this._path     = parts[6];
    if (parts[7]) this._query    = parts[7];
    if (parts[8]) this._hash     = parts[8];

    if (parts[4]) this._splitHostname(parts[4]);
  }

  URI.prototype = {
    protocol: function(val) {
      if (val) {
        this._protocol = val;
        return this;
      } else {
        return this._protocol || '';
      }
    },

    username: function(val) {
      if (val) {
        this._username = val;
        return this;
      } else {
        return this._username || '';
      }
    },

    userinfo: function(val) {
      if (val) {
        this._splitUserinfo(val);
        return this;
      } else {
        var result = '';

        if (this._username) {
          result += this._username;

          if (this._password) {
            result += ':' + this._password;
          }
        }

        return result;
      }
    },

    password: function(val) {
      if (val) {
        this._password = val;
        return this;
      } else {
        return this._password || '';
      }
    },

    hostname: function(val) {
      if (val) {
        this._splitHostname(val);
        return this;
      } else {
        var result = '';

        if (this._domain) {
          result += this._domain;
          if (this._tld) result += '.';
        }

        if (this._tld) result += this._tld;

        return result;
      }
    },

    host: function(val) {
      if (val) {
        this._splitHostAndPort(val);
        return this;
      } else {
        var hostname = this.hostname(),
            result = '';

        if (hostname) result += hostname;
        if (this._port) result += ':' + this._port;

        return result;
      }
    },

    tld: function(val) {
      if (val) {
        this._tld = val;
        return this;
      } else {
        return this._tld || '';
      }
    },

    port: function(val) {
      if (val) {
        this._port = val;
        return this;
      } else {
        return this._port || '';
      }
    },

    path: function(val) {
      if (val) {
        this._path = val;
        return this;
      } else {
        return (this._path && this._path.length > 0) ? this._path : '/';
      }
    },

    query: function(val) {
      if (val) {
        this._query = val;
        return this;
      } else {
        return this._query || '';
      }
    },

    hash: function(val) {
      if (val) {
        this._hash = val;
        return this;
      } else {
        return this._hash || '';
      }
    },

    toString: function() {
      var parts = [],
          protocol = this._protocol,
          userInfo = this.userinfo(),
          host     = this.host(),
          query    = this.query();

      if (protocol) {
        parts.push(protocol + '://');
      }

      if (userInfo.length > 0) {
        parts.push(userInfo);
        if (host) {
          parts.push('@');
        }
      }

      if (host) {
        parts.push(host);
      }

      parts.push(this.path());

      if (query.length > 0) {
        parts.push('?');
        parts.push(query);
      }

      parts.push(this._hash);

      return parts.join('');
    },

    // Private
    _splitHostname: function(hostname) {
      var parts = hostname.split('.');

      this._tld    = parts.pop();
      this._domain = parts.join('.');
    },

    _splitUserinfo: function(userinfo) {
      var parts = userinfo.split(':');

      this._username = parts.shift();
      this._password = parts.join(':');
    },

    _splitHostAndPort: function(hostAndPort) {
      var parts = hostAndPort.split(':');

      this._splitHostname(parts[0]);
      this._port = parts[1];
    }
  };

  return URI;
});