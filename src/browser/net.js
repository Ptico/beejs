define("browser/net", ["base/promise"], function(Promise) {
  "use strict";

  var net = {},
      win = window,
      contentTypeHandlers = {},
      contentTypes = {},
      readyStates = ["uninitialized", "loading", "loaded", "interactive", "complete"],
      statusTypes = { 1: "info", 2: "ok", 4: "error", 5: "error" },
      paramsReg = /(:\w+)/g,
      Request, Response,
      getXhr;

  net.getXhr = getXhr = (function() {
    if (win.XMLHttpRequest && !win.ActiveXObject) {
      return function() {
        return new win.XMLHttpRequest();
      };
    } else {
      var xhrProgId, i = 4,
      progids = ["Msxml2.XMLHTTP", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP.6.0", "Microsoft.XMLHTTP"];

      while (i--) {
        var progid = progids[i];

        try {
          new win.ActiveXObject(progid);
          xhrProgId = progid;
          break;
        } catch(e) {}
      }

      return function() {
        return new win.ActiveXObject(xhrProgId);
      };
    }
  })();

  /**
   * Add custom contentType handler
   *
   *     net.setHandler("application/json", {
   *         name: "json",
   *         getter: JSON.parse,
   *         setter: JSON.stringify
   *     });
   */
  net.setHandler = function(contentType, options) {
    contentTypeHandlers[contentType] = options;
    contentTypes[options.name] = contentType;
  };

  function setUrlParams(url, params) {
    if (url.indexOf(":") === -1) return url;

    var keys = url.match(paramsReg),
        i    = keys.length;

    while (i--) {
      var key    = keys[i],
          keyStr = key.substring(1);

      if (keyStr in params) {
        url = url.replace(key, params[keyStr]);
        delete params[keyStr];
      }
    }

    //url = url.replace(/(:\w+\/?)/, "");

    return url;
  }

  function serializeData(data) {
    var qs = [];
    for (var key in data) {
      qs.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    return qs.join('&');
  }

  Response = function(xhr) {
    var contentType = xhr.getResponseHeader("content-type"),
        body, type;

    this.xhr  = xhr;
    this.text = xhr.responseText;

    this.contentType = contentType;

    this.status      = xhr.status;
    this.statusType  = statusTypes[(this.status / 100 | 0)];
    this[this.statusType] = true;

    if (contentType in contentTypeHandlers) {
      var handler = contentTypeHandlers[contentType];

      this[handler.name] = this.content = handler.getter(xhr.responseText);
    } else {
      this.content = xhr.responseText;
    }
  };

  Request = function(type, path) {
    this.type = type.toUpperCase();
    this.path = path;

    this.promise = new Promise();

    this.options = {};
    this.headers = {};
    this.data    = {};
  };

  Request.prototype = {

    /* Promise proxy */
    on: function(state, fn, context) {
      this.promise[state](fn, context || this);
      return this;
    },

    done: function(fn, context) {
      this.promise.done(fn, context || this);
      return this;
    },

    fail: function(fn, context) {
      this.promise.fail(fn, context || this);
      return this;
    },

    anyway: function(fn, context) {
      this.promise.anyway(fn, context || this);
      return this;
    },

    /* Set options */
    set: function(key, value) {
      if (key === "header") {
        this.headers[key] = value;
      } else {
        this.options[key] = value;
      }

      return this;
    },

    setData: function(key, value) {
      if (typeof(key) === "object") {
        for (var k in key) {
          if (key.hasOwnProperty(k)) {
            this.data[k] = key[k];
          }
        }
      } else {
        this.data[key] = value;
      }

      return this;
    },

    /* Set header */
    header: function() {},

    addTarget: function() {},

    send: function() {
      var promise = this.promise,
          xhr  = getXhr(),
          type = this.type,
          opts = this.options,
          data = this.data,
          url  = setUrlParams(this.path, data),
          prevState;

      if (opts.emulate && type !== "GET" && type !== "POST") {
        data._method = type;
        this.type = type = "POST";
      }

      if (type === "GET") {
        var qs = serializeData(data);
        if (qs !== "") url += "?" + qs;
        data = null;
      }

      xhr.onreadystatechange = function() {
        var readyState = xhr.readyState;

        if (!!readyState && prevState !== readyState) {
          promise.notify(readyStates[readyState]);
        }

        if (readyState === 4) {
          var response = new Response(xhr);

          if ((xhr.status / 100 | 0) === 2 || xhr.status === 301 || (xhr.status === 0 && xhr.responseText)) {
            promise.resolve(response);
          } else {
            promise.reject(response);
          }
        }

        prevState = readyState;
      };

      xhr.open(type, url, true);

      try {
        xhr.send(data);
      } catch(e) {
        promise.reject(xhr); // TODO - promise.error()
      }

      return promise;
    }
  };

  net.Request = Request;

  return net;
});