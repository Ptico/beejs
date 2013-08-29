define("browser/net", ["base/promise"], function(Promise) {
  "use strict";

  var net = {},
      win = window,
      contentTypeHandlers = {},
      contentTypes = {},
      statusTypes = [null, 'info', 'success', 'redirect', 'clientError', 'serverError'],
      lineEndReg = /\r?\n/,
      getXhr;

  net.getXhr = function(xdr) {
    if (xdr && win.XDomainRequest) {
      return new win.XDomainRequest();
    } else {
      return new win.XMLHttpRequest();
    }
  };

  /**
   * Add custom contentType handler
   *
   *     net.setHandler("application/json", {
   *       name: "json",
   *       getter: JSON.parse,
   *       setter: JSON.stringify
   *     });
   *
   *     net.setHandler('text/plain', 'text');
   *
   *     net.setHandler({
   *       name: 'text',
   *       getter: String.prototype.trim
   *     });
   */
  net.setHandler = function(contentType, options) {
    var name;

    if (typeof(options) == 'string') {
      name = options;
    } else {
      name = options.name ? options.name : contentType;
    }

    if (options === void 0 && typeof(contentType) == 'object') {
      options = contentType;
    } else {
      contentTypes[contentType] = name;
    }

    if (typeof(options) == 'object') contentTypeHandlers[name] = options;

    return name;
  };

  net.setHandler('application/json', {
    name: 'json',
    getter: JSON.parse,
    setter: JSON.stringify
  });

  function parseHeaders(data, object) {
    var headers  = data.split(lineEndReg),
        result   = {},
        downcase = {},
        list     = [],
        l = headers.length - 1,
        i = 0;

    headers.pop();

    while(i < l) {
      var header = headers[i++],
          parts  = header.split(':'),
          key    = parts.shift(),
          value  = parts.join(':').trim();

      result[key] = value;
      downcase[key.toLowerCase()] = value;
      list.push(key);
    }

    object.headers    = result;
    object._headers   = downcase;
    object.headerKeys = list;

    return object;
  }

  function parseResponseBody(body, contentType, object) {
    var type    = contentTypes[contentType],
        handler = contentTypeHandlers[type];

    if (type && handler && handler.getter) {
      try {
        object[type] = object.body = handler.getter.call(body, body);
      } catch(e) {
        object.body = body;
      }
    } else {
      object.body = body;
    }

    return object;
  }

  /**
   * Response object
   */
  function Response(xhr, request) {
    var status       = xhr.status,
        contentType  = xhr.getResponseHeader("Content-Type"),
        responseText = xhr.responseText;

    // Inject origins
    this.xhr     = xhr;
    this.request = request;

    // Set status props
    this.status     = status;
    this.statusType = statusTypes[status / 100 | 0];
    this.statusText = xhr.statusText;
    this[this.statusType] = true;
    this.error = this.clientError || this.serverError;

    // Set headers props
    parseHeaders(xhr.getAllResponseHeaders(), this);
    this.contentType = contentType;
    this.type = contentTypes[contentType];

    // Set body props
    this.text = responseText;
    parseResponseBody(responseText, contentType, this);
  }

  Response.prototype = {
    info: false,
    success: false,
    redirect: false,
    clientError: false,
    serverError: false,

    get: function(key) {
      return this._headers[key.toLowerCase()];
    }
  };


  /**
   * Request
   */
  function Request(type, url, options) {
    this.type = type.toUpperCase();
    this.path = url;
  }

  Request.prototype = {
    set: function(key, value) {},
    setHeader: function(key, value) {},
    send: function() {
      
    }
  };

  net.Response = Response;
  net.Request = Request;

  return net;
});