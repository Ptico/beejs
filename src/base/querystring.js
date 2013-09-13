define('base/querystring', ['base/util'], function(util) {
  'use strict';

  var keyReg = /(.*)\[(\w*)\]$/,
      plusReg = /\+/g,
      brackReg = /\[\s+\]/g,
      toStr  = Object.prototype.toString,

  QueryString = {

    /**
     * Default options
     */
    defaults: {
      delimiter: '&',
      eq: '=',
      brackets: true,
      keyIndex: true,
      timeFormat: false,
      escape: true
    },

    /**
     * Escape symbols for URI. Used internally. May be redefined.
     *
     * @param {String} String to escape
     *
     * @returns {String} Escaped string
     */
    escape: encodeURIComponent,

    /**
     * Unescape encoded URI symbols. Used internally. May be redefined.
     *
     * @param {String} str String to unescape
     *
     * @returns {String} Unescaped string
     */
    unescape: function(str) {
      return decodeURIComponent(str).replace(brackReg, '[]');
    },

    /**
     * Serialize object to query string
     *
     *     QueryString.stringify({a: {b: 'c', d: 'f'}}); // "a[b]=c&a[d]=f"
     *     QueryString.stringify({a: 'foo, b: [1, 2]}); // "a=foo&b[]=1&b[]=2"
     *     QueryString.stringify({a: [1, 2]}, {brackets: false}); // "a=1&a=2"
     *     QueryString.stringify({a: [1, 2]}, {keyIndex: true}); // "a[0]=1&a[1]=2"
     *     QueryString.stringify({a: 1, b: 2}, { eq: ':', delimiter: ',' }); // "a:1,b:2"
     *
     * @param {Object} object    Object with data
     * @param {Object} [options] Build options
     * @param {Boolean} [options.brackets]   If true, adds `[]` to key name. Default: true
     * @param {Boolean} [options.keyIndex]   If true, adds array index to key. Default: true
     * @param {String}  [options.timeFormat] Time as strftime string. If not set: displays time as unix timestamp
     * @param {String}  [options.eq]         Symbol used as key-value delimiter. Default: '='
     * @param {String}  [options.delimiter]  Symbol used as pairs delimiter. Default: '&'
     *
     * @returns {String} Query string
     */
    stringify: function(object, options) {
      return (new Stringify(object, options)).result;
    },

    /**
     * Parse query string to object
     *
     *     QueryString.parse('a[b]=c&a[d]=f'); // {a: {b: 'c', d: 'f'}}
     *     QueryString.parse('a=foo&b[]=1&b[]=2'); // {a: 'foo, b: [1, 2]}
     *     QueryString.parse('a:1,b:2', { eq: ':', delimiter: ',' }); // { a: 1, b: 2 }
     *
     * @param {String} string   Query string
     * @param {Object} [optins] Parse options
     * @param {String}  [options.eq]         Symbol used as key-value delimiter. Default: '='
     * @param {String}  [options.delimiter]  Symbol used as pairs delimiter. Default: '&'
     *
     * @returns {Object} Deserialized object
     */
    parse: function(string, options) {
      var opts = Object.create(QueryString.defaults),
          result = {},
          arr;

      util.merge(opts, options);

      string = string.replace(plusReg, ' ');
      arr    = string.split(opts.delimiter);

      arr.reduce(function(result, v) {
        var pair = v.split(opts.eq),
            key  = QueryString.unescape(pair.shift()),
            val  = pair.length === 0 ? undefined : QueryString.unescape(pair.join(opts.eq));

        return parsePiece(key, coerce(val), result);
      }, result);

      return result;
    }
  };


  ////////////////////////////
  //////// Stringifier ///////
  ////////////////////////////
  function Stringify(object, options) {
    // Merge default options
    var opts = Object.create(QueryString.defaults);
    util.merge(opts, options);

    // Assign options to object variables
    var  sep  = opts.delimiter;
    this.eq   = opts.eq;
    this.brackets = opts.brackets;
    this.keyIndex   = opts.keyIndex;
    this.escape     = opts.escape;
    this.timeFormat = opts.timeFormat;

    // Array of key-value parts
    this.arr = [];

    // Visit root object
    this.visitors.object.call(this, false, object);

    // Join key-value parts with delimiter and assign to result
    this.result = this.arr.join(sep);
  }

  // String visitor. Common for string, number and boolean
  function visitString(k, v) {
    /*jshint validthis:true */
    v = v.toString();

    if (this.escape) {
      k = QueryString.escape(k);
      v = QueryString.escape(v);
    }

    this.arr.push(k + this.eq + v);
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
      'undefined': function(k, v) {
        this.arr.push(k);
      },

      // Visit date: konvert value to strftime string when option `timeFormat` is set
      date: function(k, v) {
        var tf = this.timeFormat,
            val = tf ? util.strftime(v, tf) : v.getTime().toString();

        if (this.escape) {
          k   = QueryString.escape(k);
          val = QueryString.escape(val);
        }

        this.arr.push(k + this.eq + val);
      },

      // Recursively visit array
      array: function(k, v) {
        var l = v.length,
            i = 0,
            brackets = this.brackets,
            ki   = this.keyIndex,
            nested;

        // Detect array or object and force inserting indices
        nested = v.filter(function(v) {
          return typeof(v) == 'object' && ((v instanceof Array) || toStr.call(v) == '[object Object]');
        }).length > 0;
        if (nested) ki = true;

        // Iterate over value's elements
        while (i < l) {
          var key = k,
              val = v[i];

          // If option `brackets` is true - insert brackets indicated array
          if (brackets) {
            // If option `keyIndex` is true or value contains another
            // objects - insert index inside brackets: foo[0], foo[1] ...
            // Otherwise: use only []: foo[], foo[]
            key += (ki || typeof(val) == 'object') ? '[' + i + ']' : '[]';
          }

          this.visit(key, val);

          i++;
        }
      },

      // Recursively visit object
      object: function(k, v) {
        for (var kk in v) {
          if (v.hasOwnProperty(kk)) {
            // If key present: use form like { "key[nestedkey]": "value" }
            // else - build plain object: { "nestedkey": "value" }
            // Second variant used only in Stringify constructor
            var name = k ? k + '[' + kk + ']' : kk;

            this.visit(name, v[kk]);
          }
        }
      }
    }
  };

  ////////////////////////////
  ////////// Parser //////////
  ////////////////////////////
  function parsePiece(k, v, previous) {

    var bs = k.indexOf('[');

    if (bs > -1) { // Given 'foo[1][a][]'
      var init = k.slice(0, bs) + ']', // 'foo]'
          rest = k.slice(bs + 1), // '1][a][]'
          arr  = rest.split('['), // [ '1]', 'a]', ']' ]
          obj  = previous,
          l = arr.length + 1, i = 0;

      arr.unshift(init);

      while (i < l) { // ['foo]', '1]', 'a]', ']' ]
        var key  = arr[i].slice(0, -1), // ['foo', '1', 'a', '']
            next = arr[i+1];

        if (!obj[key]) {
          if (next) {
            next = next.slice(0, -1);

            obj[key] = (!isNaN(next)) ? [] : {};
          } else {
            if ((obj instanceof Array) && key === '') {
              obj.push(v);
            } else {
              obj[key] = v;
            }
          }
        }

        obj = obj[key];

        i++;
      }
    } else {
      previous[k] = v;
    }

    return previous;
  }

  function coerce(val) {
    if (!isNaN(val)) return +val; // Number

    // Boolean
    if ('true' === val) return true;
    if ('false' === val) return false;

    return val;
  }

  return QueryString;
});