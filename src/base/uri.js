define('base/uri', [], function() {
  'use strict';

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
    if (typeof URIString != 'undefined') {
      var parts = URIString.match(uriReg);

      if (parts[1]) this._protocol = parts[1];
      if (parts[2]) this._username = parts[2];
      if (parts[3]) this._password = parts[3];
      if (parts[5]) this._port     = parts[5];
      if (parts[6]) this._path     = parts[6];
      if (parts[7]) this._query    = parts[7];
      if (parts[8]) this.fragment  = parts[8];

      if (parts[4]) this._splitHostname(parts[4]);
    }
  }

  URI.prototype = {
    get protocol() {
      return this._protocol || '';
    },

    set protocol(val) {
      this._protocol = val;
    },

    setProtocol: function(val) {
      this._protocol = val;
      return this;
    },

    get user() {
      return this._username || '';
    },

    set user(val) {
      this._username = val;
    },

    setUser: function(val) {
      this._username = val;
      return this;
    },

    get password() {
      return this._password || '';
    },

    set password(val) {
      this._password = val;
    },

    setPassword: function(val) {
      this._password = val;
      return this;
    },

    get userinfo() {
      var result = '';

      if (this._username) {
        result += this._username;

        if (this._password) {
          result += ':' + this._password;
        }
      }

      return result;
    },

    set userinfo(val) {
      this._splitUserinfo(val);
    },

    setUserInfo: function(val) {
      this._splitUserinfo(val);
      return this;
    },

    get host() {
      var result = '';

      if (this._domain) {
        result += this._domain;
        if (this._tld) result += '.';
      }

      if (this._tld) result += this._tld;

      return result;
    },

    set host(val) {
      this._splitHostname(val);
    },

    setHost: function(val) {
      this._splitHostname(val);
      return this;
    },

    get tld() {
      return this._tld || '';
    },

    set tld(val) {
      this._tld = val;
    },

    setTld: function(val) {
      this._tld = val; // TODO - remove leading `.`
      return this;
    },

    get port() {
      return this._port || '';
    },

    set port(val) {
      this._port = val;
    },

    setPort: function(val) {
      this._port = val;
      return this;
    },

    get path() {
      return (this._path && this._path.length > 0) ? this._path : '';
    },

    set path(val) {
      this._path = val;
    },

    setPath: function(val) {
      this._path = val;
      return this;
    },

    get query() {
      return this._query ? encodeURI(this._query) : '';
    },

    set query(val) {
      this._query = val; // TODO - remove leading `?`
    },

    setQuery: function(val) {
      this.query = val;
      return this;
    },

    get hash() {
      return (this._fragment && this._fragment.length > 0) ? ('#' + this._fragment) : '';
    },

    set hash(val) {
      this._fragment = (val.substr(0, 1) === '#') ? val.substr(1) : val;
    },

    setHash: function(val) {
      this.hash = val;
    },

    get fragment() {
      return this._fragment || '';
    },

    set fragment(val) {
      this._fragment = (val.substr(0, 1) === '#') ? val.substr(1) : val;
    },

    setFragment: function(val) {
      this.fragment = val;
      return this;
    },

    toString: function() {
      var parts = [],
          protocol = this._protocol,
          userInfo = this.userinfo,
          host     = this.host,
          port     = this._port,
          query    = this.query;

      if (protocol) parts.push(protocol + '://');

      if (userInfo.length > 0) {
        parts.push(userInfo);
        parts.push('@');
      }

      if (host) parts.push(host);
      if (port) parts.push(':' + this.port);

      parts.push(this.path);

      if (query.length > 0) {
        parts.push('?');
        parts.push(query);
      }

      parts.push(this.hash);

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
    }
  };

  return URI;
});
