define("base/enumerable", [], function() {
  "use strict";

  var Enum = {};

  Enum.List = function() {};

  Enum.List.prototype = {
    /**
     * Iterate over array
     */
    each: function(fn, context) {
      var array = this, i = 0, len = array.length;

      context = context || array;

      if (fn.call !== void 0) {
        for (; i < len; i++) fn.call(context, array[i], i, array);
      } else {
        for (; i < len; i++) array[i][fn]();
      }

      return this;
    },

    /**
     * Iterates the given function for each slice of <num> elements
     */
    eachSlice: function(num, fn, context) {
      var array = this,
          i = 0,
          j = 0,
          len = array.length,
          iters = -~(len / num),
          k, res;

      context = context || array;

      for (; i < iters; i++) {
        k = j + num;
        res = array.slice(j, k);

        fn.call(context, res, i, array);

        j = k;
      }

      return this;
    },

    
    map: function(fn, context) {
      var array  = this,
          len    = array.length,
          result = new array.constructor(len),
          i      = 0;

      context = context || array;

      if (fn.call !== void 0) {
        for (; i < len; i++) result[i] = fn.call(context, array[i], i, array);
      } else {
        for (; i < len; i++) result[i] = array[i][fn]();
      }

      return result;
    },

    /**
     * Get list of properties from collection
     *
     *     var people = [{ name: "Jim", age: 21 }, { name: "Joe", age: 23 }];
     *
     *     people.pluck("name"); //=> ["Jim", "Joe"]
     *     people.pluck("age");  //=> [21, 23]
     *
     * @param {String} key Property name to get
     */
    pluck: function(key) {
      var array  = this,
          len    = array.length,
          result = new array.constructor(len),
          i      = 0;

      for (; i < len; i++) result[i] = array[i][key];

      return result;
    },

    reduce: function(fn, initial, context) {
      var i = 0, l = this.length, curr;

      context = context || void 0;

      if (initial === void 0) {
        curr = this[0];
        i = 1;
      } else {
        curr = initial;
      }

      while (i < l) {
        if (i in this) curr = fn.call(context, curr, this[i], i, this);
        ++i;
      }

      return curr;
    },

    reduceRight: function() {},

    /**
     * Passes each entry in enum to function. Returns the first for which function result is not false
     *
     *     var nums = [1, 2, 3, 4];
     *
     *     nums.find(function(v) { return v > 2; }); //=> 3
     *
     * @param {Function} fn        Iterator function or key string
     * @param            [context] Context for using as `this` in a callback
     */
    find: function(fn, context) {
      var array = this, i = 0, len = array.length;

      context = context || array;

      for (; i < len; i++) if (fn.call(context, array[i], i, array)) return array[i];

      return void 0;
    },

    /**
     * Returns an array containing all elements of enum for which function result is not false
     *
     *     var nums = [1, 2, 3, 4];
     *
     *     nums.findAll(function(v) { return v > 2; }); //=> [3, 4]
     *
     * @param {Function} fn        Iterator function or key string
     * @param            [context] Context for using as `this` in a callback
     */
    findAll: function(fn, context) {
      var array  = this,
          len    = array.length,
          result = new array.constructor(),
          i      = 0;

      context = context || array;

      for (; i < len; i++) if (fn.call(context, array[i], i, array)) result.push(array[i]);

      return result;
    },

    reject: function(fn, context) {
      
    },

    /**
     * Sorts enum using a set of keys generated by mapping the values in enum through the given function.
     *
     *     var names = ["Ann", "Peter", "John", "Bob", "Garry"];
     *
     *     names.sortBy(function(name) { return name.length; });
     *
     *     // or shorter variant:
     *
     *     names.sortBy("length");
     *
     *     // Will result: ["Ann", "Bob", "John", "Peter", "Garry"]
     *
     * @param {Function|String} fn        Iterator function or key string
     * @param                   [context] Context for using as `this` in a callback
     */
    sortBy: function(fn, context) {
      var array    = this,
          len      = array.length,
          sortable = new array.constructor(len),
          i        = 0,
          isFn     = (fn.call !== void 0),
          sorted;

      context = context || array;

      for (; i < len; i++) {
        var value = array[i];

        sortable[i] = {
          value: array[i],
          index: i,
          criteria: isFn ? fn.call(context, value, i, array) : value[fn]
        };
      }

      sorted = sortable.sort(function(left, right) {
        var a = left.criteria, b = right.criteria;

        if (a !== b) {
          if (a > b || a === void 0) return 1;
          if (a < b || b === void 0) return -1;
        }

        return left.index < right.index ? -1 : 1;
      });

      return this.pluck.call(sorted, "value");
    },

    /**
     * Returns a hash, which keys are evaluated result from the block,
     * and values are arrays of elements in enum corresponding to the key.
     *
     *     var names = ["Ann", "Peter", "John", "Bob", "Garry"];
     *
     *     names.groupBy(function(name) { return name.length; });
     *
     *     // or shorter variant:
     *
     *     names.groupBy("length");
     *
     *     // Will result: { "3": ["Ann", "Bob"], "4": ["John"], 5: ["Peter", "Garry"] }
     *
     * @param {Function|String} fn        Iterator function or key string
     * @param                   [context] Context for using as `this` in a callback
     */
    groupBy: function(fn, context) {
      var array  = this,
          i      = 0,
          len    = array.length,
          isFn   = (fn.call !== void 0),
          result = {};

      context = context || array;

      for (; i < len; i++) {
        var val = array[i],
            key = (isFn ? fn.call(context, val, i, array) : val[fn]()).toString();

        if (result[key]) {
          result[key].push(val);
        } else {
          result[key] = [val];
        }
      }

      return result;
    },

    /**
     *
     */
    count: function() {
      
    }
  };

  Enum.List.provides = "enumerable";

  return Enum;
});