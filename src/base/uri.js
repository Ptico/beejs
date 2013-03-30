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
  var uriReg = /^(?:(?:([\w.+-]+):)?\/\/)?(?:([^:@]*)(?::([^:@]*))?@)?([^:\/?#]+)?(?::(\d*))?(\/[^?#]*)?(?:\?([^#]*))?(#.*)?$/;

  function URI(URIString) {

  }

  URI.prototype = {

  };

  return URI;
});