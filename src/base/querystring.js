define('base/querystring', ['base/util'], function(util) {
  'use strict';

  var QueryString = {
    defaults: {
      separator: '&',
      eq: '=',
      keys: true,
      keyIndex: false,
      timeFormat: false
    },
    escape: encodeURIComponent,
    unescape: decodeURIComponent,
    stringify: function(object, options) {
      return (new Stringify(object, options)).result;
    }
  };

  function visitString(k, v) {
    /*jshint validthis:true */
    this.arr.push(k + this.eq + QueryString.escape(v.toString()));
  }

  function Stringify(object, options) {
    var opts = Object.create(QueryString.defaults);

    util.merge(opts, options);

    var  sep  = opts.separator || '&';
    this.eq   = opts.eq        || '=';
    this.keys = opts.keys;
    this.keyIndex   = opts.keyIndex;
    this.timeFormat = opts.timeFormat;

    this.arr = [];

    this.visit(false, object);

    this.result = this.arr.join(sep);
  }

  Stringify.prototype = {
    visit: function(k, v) {
      var visitors = this.visitors;
      visitors[util.typeOf(v)].call(this, k, v);
    },

    visitors: {
      string: visitString,
      number: visitString,
      boolean: visitString,

      date: function(k, v) {
        var tf = this.timeFormat,
            val = tf ? QueryString.escape(util.strftime(v, tf)) : v.getTime().toString();

        this.arr.push(k + this.eq + val);
      },

      array: function(k, v) {
        var l = v.length,
            i = 0,
            keys = this.keys,
            ki   = this.keyIndex;

        while (i < l) {
          var key = k;

          if (keys) {
            key += ki ? '[' + i + ']' : '[]';
          }

          this.visit(key, v[i++]);
        }
      },

      object: function(k, v) {
        for (var kk in v) {
          if (v.hasOwnProperty(kk)) {
            var name = k ? k + '[' + kk + ']' : kk;

            this.visit(name, v[kk]);
          }
        }
      }
    }
  };

  return QueryString;
});