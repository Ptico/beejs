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
      keys: true,
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
     *     QueryString.stringify({a: [1, 2]}, {keys: false}); // "a=1&a=2"
     *     QueryString.stringify({a: [1, 2]}, {keyIndex: true}); // "a[0]=1&a[1]=2"
     *     QueryString.stringify({a: 1, b: 2}, { eq: ':', delimiter: ',' }); // "a:1,b:2"
     *
     * @param {Object} object    Object with data
     * @param {Object} [options] Build options
     * @param {Boolean} [options.keys]       If true, adds `[]` to key name. Default: true
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
     *     QueryString.parse('a=1&a=2'); // { a: 2 }
     *     QueryString.parse('a=1&a=2', { keys: false }); // { a: [1, 2] }
     *     QueryString.parse('a:1,b:2', { eq: ':', delimiter: ',' }); // { a: 1, b: 2 }
     *
     * @param {String} string   Query string
     * @param {Object} [optins] Parse options
     * @param {Boolean} [options.keys]       If false - merge values into array. Default: true
     * @param {String}  [options.eq]         Symbol used as key-value delimiter. Default: '='
     * @param {String}  [options.delimiter]  Symbol used as pairs delimiter. Default: '&'
     *
     * @returns {Object} Deserialized object
     */
    parse: function(string, options) {
      return (new Parser(string, options)).result;
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
    this.keys = opts.keys;
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
            keys = this.keys,
            ki   = this.keyIndex,
            nested;

        // Detect array or object and force inserting indices
        nested = v.filter(function(v) {
          return typeof(v) == 'object' && ((v instanceof Array) || toStr.call(v) === '[object Object]');
        }).length > 0;
        if (nested) ki = true;

        // Iterate over value's elements
        while (i < l) {
          var key = k,
              val = v[i];

          // If option `keys` is true - insert brackets indicated array
          if (keys) {
            // If option `keyIndex` is true or value contains another
            // objects - insert index inside brackets: foo[0], foo[1] ...
            // Otherwise: use only []: foo[], foo[]
            key += (ki || typeof(val) === 'object') ? '[' + i + ']' : '[]';
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
  function Parser(string, options) {
    var result = {},
        opts = Object.create(QueryString.defaults),
        i = 0, l,
        arr,
        newarr = new Array(l);

    // Merge default options
    util.merge(opts, options);

    // Replace + with space
    string = string.replace(plusReg, ' ');

    // Get array of key-value pairs
    arr = string.split(opts.delimiter);
    l = arr.length;

    // Map step: convert array of pairs to array of parsed object trees
    // F.e: a[1][q]=42 will be transformed to { a: [ undefined, { q: 42 } ] }
    while (i < l) {
      var pair = arr[i].split(opts.eq),
          key  = QueryString.unescape(pair.shift()),
          val  = QueryString.unescape(pair.join('='));

      newarr[i++] = this.parsePiece(key, this.coerce(val));
    }

    // Reduce step: merge array of trees to the single object
    i = 0;
    if (opts.keys) {
      while (i < l) result = util.deepMerge(result, newarr[i++]);
    } else { // Only flat objects supported when we don't have `[]`
      while (i < l) {
        var obj = newarr[i++];

        for (var k in obj) {
          var v = obj[k];

          if (result.hasOwnProperty(k)) {
            var existing = result[k];

            if (!(existing instanceof Array)) result[k] = [existing]; // If key already exists - create array

            result[k].push(v);
          } else {
            result[k] = v;
          }
        }
      }
    }

    // Assign result
    this.result = result;
  }

  Parser.prototype = {
    // Build object from the key and value
    parsePiece: function(k, v) {

      // Parse the key and find nested objects
      // keyReg.exec('key[1][a][]') -> ["key[1][a][]", "key[1][a]", ""]
      // keyReg.exec('key[1][a]') -> ["key[1][a]", "key[1]", "a"]
      // keyReg.exec('key[1]) -> ["key[1]", "key", "1"]
      // keyReg.exec('key) -> null
      var split = keyReg.exec(k);

      if (split) { // Recursively build nested object tree
        var rest, key, val;

        rest = split[1];
        key  = split[2]; // Array/Object key

        if (key === '') { // Array without index TODO: trim
          val = [v];
        } else {
          if (!isNaN(key)) { // If key is number - create empty array and insert value to it's position
            var index = +key;
            val = new Array(index + 1);
            val[index] = v;
          } else { // If key a string - create object
            val = {};
            val[key] = v;
          }
        }

        return this.parsePiece(rest, val);
      } else { // Just a single key-value or the root of object tree
        var res = {};
        res[k] = v;
        return res;
      }
    },

    // Coerce value type
    coerce: function(val) {
      if (!isNaN(val)) return +val; // Number

      // Boolean
      if ('true' === val) return true;
      if ('false' === val) return false;

      return val;
    }
  };

  return QueryString;
});