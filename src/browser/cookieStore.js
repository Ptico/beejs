define("browser/cookieStore", [], function() {
  "use strict";

  var doc = window.document;

  var cookieStore = {
    /**
     * Set attribute
     */
    set: function(obj, key, value, options) {
      options = options || {};

      var cookieString = encodeURIComponent(key) + "=",
          valType = typeof(value),
          path    = options.path || "/";

      if (valType === "object") {
        cookieString += JSON.stringify(value);
      } else cookieString += escape(value);

      if (options.days || options.hours || options.seconds) {
        var date = new Date(), time;

        if (options.seconds)      time = parseInt(options.seconds, 10);
        else if (options.minutes) time = parseInt(options.minutes, 10) * 60;
        else if (options.hours)   time = parseInt(options.hours, 10) * 60 * 60;
        else if (options.days)    time = parseInt(options.days, 10) * 24 * 60 * 60;

        date.setTime(date.getTime() + time);

        cookieString += "; expires=" + date.toGMTString();
      }

      window.document.cookie = cookieString + "; path=" + path;
    },

    /**
     * Get attribute
     */
    get: function(obj, key) {
      var keyStr = encodeURIComponent(key) + "=",
          keyLen = keyStr.length,
          cook   = window.document.cookie.split("; "); // TODO - Cache

      for (var i = 0, l = cook.length, curr; i < l; i++) {
        curr = cook[i];

        if (curr.substring(0, keyLen) === keyStr) {
          var val = curr.substring(keyLen, curr.length);

          if (val.substring(0, 1) === "{" || val.substring(0, 1) === "[") {
            return JSON.parse(val);
          } else if (val === "undefined") {
            return void 0;
          } else {
            return unescape(val);
          }
        }
      }

      return void 0;
    },

    /**
     * Erase attribute
     */
    erase: function(obj, key) {
      cookieStore.set(obj, key, undefined, { seconds: -1 });
    },

    /**
     * Erase all attributes
     */
    eraseAll: function(obj) {
      var res = cookieStore.keys();

      for (var i=0; i < res.length; i++) {
        cookieStore.set(obj, res[i], undefined, { seconds: -1 });
      }
    },

    /**
     * Get list of keys
     */
    keys: function() {
      var cook    = window.document.cookie.split("; "),
          cookLen = cook.length,
          result  = new Array(cookLen);

      for (var i = 0, ind, curr, k; i < cookLen; i++) {
        curr = cook[i];

        if (curr.length !== 0) {
          ind = curr.indexOf("=");
          result[i] = decodeURIComponent(curr.substring(0, ind));
        }
      }

      return result;
    }

  };

  return cookieStore;
});