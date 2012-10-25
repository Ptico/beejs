define("base/enumerable", [], function() {
  "use strict";

  var Enum = {},
      List, Enumerator;

  Enum.Enumerator = function() {};

  Enum.Enumerator.prototype = Enumerator = {
    /**
     * Executes a provided function for each element in enum
     *
     * Function `fn` is invoked with three arguments: 
     * - the value of the element, 
     * - the index of the element, 
     * - the enum object being traversed
     *
     * If `context` is not defined, current enum object will be bound as `this`
     *
     *     var nums = [1, 2, 3];
     *
     *     nums.each(function(v) { console.log(v); });
     *
     * @param {Function} fn        Iterator function or key string
     * @param            [context] Context for using as `this` inside function
     */
    each: function(fn, context) {
      var array = this,
          i = 0,
          len = array.length;

      context = context || array;

      if (fn.call !== void 0) {
        for (; i < len; i++) fn.call(context, array[i], i, array);
      } else {
        for (; i < len; i++) array[i][fn]();
      }

      return this;
    },

    /**
     * Executes a provided function for each slice of `num` elements
     *
     * Function `fn` is invoked with three arguments: 
     * - slice of values of the element, 
     * - the index of the element, 
     * - the enum object being traversed
     *
     * If `context` is not defined, current enum object will be bound as `this`
     *
     * @param {Number}   num       The number of items to include in each slice
     * @param {Function} fn        Iterator function or key string
     * @param            [context] Context for using as `this` inside function
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

    /**
     * Creates a new enum with the results of calling a provided function
     * on each element in this enum.
     *
     * Function `fn` is invoked with three arguments: 
     * - the value of the element, 
     * - the index of the element, 
     * - the enum object being traversed
     *
     * If `context` is not defined, current enum object will be bound as `this`
     *
     *     var names = ["jim", "joe"];
     *
     *     names.map(function(n) { return n.toUpperCase(); }); //=> ["JIM", "JOE"]
     *     names.map("toUpperCase"); //=> ["JIM", "JOE"]
     *
     * @param {Function} fn        Iterator function or key string
     * @param            [context] Context for using as `this` inside function
     */
    map: function(fn, context) {
      var array  = this,
          len    = array.length,
          result = new array.constructor(),
          i      = 0;

      context = context || array;

      if (fn.call !== void 0) {
        for (; i < len; i++) result.push(fn.call(context, array[i], i, array));
      } else {
        while (i < len) result.push(array[i++][fn]());
      }

      return result;
    },

    /**
     * Creates a new enum with the given property of each element
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
          result = new array.constructor(),
          i      = 0;

      while (i < len) result.push(array[i++][key]);

      return result;
    },

    /**
     * Produces single result from enum elements
     *
     * Function `fn` is invoked with three arguments: 
     * - the value of the element, 
     * - the index of the element, 
     * - the enum object being traversed
     *
     * If `context` is not defined, current enum object will be bound as `this`
     * 
     * @param {Function} fn        Iterator function or key string
     * @param            initial   Object to use as the first argument to the first call of the `fn`
     * @param            [context] Context for using as `this` inside function
     */
    reduce: function(fn, initial, context) {
      var array = this, i = 0, len = array.length, curr;

      if (initial === void 0) {
        curr = array[0];
        i = 1;
      } else {
        curr = initial;
      }

      context = context || array;

      while (i < len) {
        if (i in array) curr = fn.call(context, curr, array[i], i, array);
        ++i;
      }

      return curr;
    },

    /**
     * Produces single result from enum elements (from right-to-left)
     *
     * Function `fn` is invoked with three arguments: 
     * - the value of the element, 
     * - the index of the element, 
     * - the enum object being traversed
     *
     * If `context` is not defined, current enum object will be bound as `this`
     * 
     * @param {Function} fn        Iterator function or key string
     * @param            initial   Object to use as the first argument to the first call of the `fn`
     * @param            [context] Context for using as `this` inside function
     */
    reduceRight: function(fn, initial, context) {
      var array = this, len = array.length, i = len - 1, curr;

      if (initial === void 0) {
        curr = array[len - 1];
        i--;
      } else {
        curr = initial;
      }

      context = context || array;

      while (i >= 0) {
        if (i in array) curr = fn.call(context, curr, array[i], i, array);
        i--;
      }

      return curr;
    },

    /**
     * Passes each entry in enum to function. Returns the first for which function result is not false
     * Alias: #detect
     *
     * Function `fn` is invoked with three arguments: 
     * - the value of the element, 
     * - the index of the element, 
     * - the enum object being traversed
     *
     * If `context` is not defined, current enum object will be bound as `this`
     *
     *     var nums = [1, 2, 3, 4];
     *
     *     nums.find(function(v) { return v > 2; }); //=> 3
     *
     * @param {Function} fn        Iterator function or key string
     * @param            [context] Context for using as `this` inside function
     */
    find: function(fn, context) {
      var array = this, i = 0, len = array.length;

      context = context || array;

      for (; i < len; i++) if (fn.call(context, array[i], i, array)) return array[i];

      return void 0;
    },

    /**
     * Returns an array containing all elements of enum for which function result is not false
     * Alias: #select
     *
     * Function `fn` is invoked with three arguments: 
     * - the value of the element, 
     * - the index of the element, 
     * - the enum object being traversed
     *
     * If `context` is not defined, current enum object will be bound as `this`
     *
     *     var nums = [1, 2, 3, 4];
     *
     *     nums.findAll(function(v) { return v > 2; }); //=> [3, 4]
     *
     * @param {Function} fn        Iterator function or key string
     * @param            [context] Context for using as `this` inside function
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

    /**
     * Returns an array containing all elements of enum for which function result is false
     *
     * Function `fn` is invoked with three arguments: 
     * - the value of the element, 
     * - the index of the element, 
     * - the enum object being traversed
     *
     * If `context` is not defined, current enum object will be bound as `this`
     *
     *     var nums = [1, 2, 3, 4];
     *
     *     nums.reject(function(v) { return v > 2; }); //=> [1, 2]
     *
     * @param {Function} fn        Iterator function or key string
     * @param            [context] Context for using as `this` inside function
     */
    reject: function(fn, context) {
      var array  = this,
          len    = array.length,
          result = new array.constructor(),
          i      = 0;

      context = context || array;

      for (; i < len; i++) if (!fn.call(context, array[i], i, array)) result.push(array[i]);

      return result;
    },

    /**
     * Sorts enum using a set of keys generated by mapping the elements in enum 
     * through the given function.
     *
     * Function `fn` is invoked with three arguments: 
     * - the value of the element, 
     * - the index of the element, 
     * - the enum object being traversed
     *
     * If `context` is not defined, current enum object will be bound as `this`
     *
     *     var names = ["Ann", "Peter", "John", "Bob", "Garry"];
     *
     *     names.sortBy(function(name) { return name.length; });
     *     // or shorter variant:
     *     names.sortBy("length");
     *
     *     // Will result: ["Ann", "Bob", "John", "Peter", "Garry"]
     *
     * @param {Function|String} fn        Iterator function or key string
     * @param                   [context] Context for using as `this` inside function
     */
    sortBy: function(fn, context) {
      var array    = this,
          len      = array.length,
          sortable = new Array(len),
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
     * Returns a hash, which keys are evaluated result from the function,
     * and values are arrays of elements in enum corresponding to the key.
     *
     * Function `fn` is invoked with three arguments: 
     * - the value of the element, 
     * - the index of the element, 
     * - the enum object being traversed
     *
     * If `context` is not defined, current enum object will be bound as `this`
     *
     *     var names = ["Ann", "Peter", "John", "Bob", "Garry"];
     *
     *     names.groupBy(function(name) { return name.length; });
     *     // or shorter variant:
     *     names.groupBy("length");
     *
     *     // Will result: { "3": ["Ann", "Bob"], "4": ["John"], 5: ["Peter", "Garry"] }
     *
     * @param {Function|String} fn        Iterator function or key string
     * @param                   [context] Context for using as `this` inside function
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
     * Returns the number of elements in enum.
     * If an argument is given, counts the number of items in List, for which
     * equals to element. If a function is given, counts the number of elements
     * yielding a true value.
     *
     * Function `fn` is invoked with three arguments: 
     * - the value of the element, 
     * - the index of the element, 
     * - the enum object being traversed
     *
     * If `context` is not defined, current enum object will be bound as `this`
     *
     *     var names = ["Fil", "Bob", "Fil", "Jack"];
     *
     *     names.count(); //=> 4
     *     names.count("Fil"); //=> 2
     *     names.count(function(name) { return name.length > 3; }); //=> 1
     *
     * @param [match]   Function contains the condition to count, or object to find and count in List
     * @param [context] Context for using as `this` inside function
     */
    count: function(match, context) {
      var array = this,
          len   = array.length,
          i = 0,
          j = 0;

      if (match === void 0) {
        return len;
      } else if (match.call !== void 0) {
        context = context || array;

        for (; i < len; i++) if (match.call(context, array[i], i, array)) j++;
      } else {
        for (; i < len; i++) if (match === array[i]) j++;
      }

      return j;
    },

    /**
     * Return first `n` elements.
     * If no arguments given - return only one element
     *
     * @param {Number} n Quantity of elements which you can get
     */
    first: function(n) {
      if (n !== void 0 && n % 1 === 0) {
        var result = new this.constructor();
        result.push.apply(result, this.slice(0, n));
        return result;
      } else {
        return this[0];
      }
    },

    /**
     * Return last `n` elements.
     * If no arguments given - return only one element
     *
     * @param {Number} n Quantity of elements which you can get
     */
    last: function(n) {
      if (n !== void 0 && n % 1 === 0) {
        var result = new this.constructor();
        result.push.apply(result, this.slice(this.length - n));
        return result;
      } else {
        return this[this.length - 1];
      }
    }
  };

  Enum.Enumerator.prototype.detect = Enum.Enumerator.prototype.find;

  Enum.Enumerator.provides = "enumerable";

  /**
   * Array-like object extended with enumerable.Enumerator
   * List constructor works as Array constructor with one difference:
   * when we pass an Array - it converts to List
   *
   * @class
   * @param {collection} Array to convert to List
   */
  List = function(collection) {
    // Hide length from enums if possible
    if (Object.defineProperty !== void 0) {
      Object.defineProperty(this, "length", {
        writable: true,
        enumerable: false,
        configurable: false,
        value: 0
      });
    }

    if (arguments.length === 1 && collection % 1 === 0) {
      this.length = -1 < collection ? collection : this.push(collection);
    } else if (arguments.length) {
      this.push.apply(this, arguments);
    }
  };

  // Copy array prototype to List prototype
  var Copy = function() {};
  Copy.prototype = Array.prototype;
  List.prototype = new Copy();

  List.prototype.constructor = List;

  // Extend List prototype with Enumerator
  for (var meth in Enumerator) {
    if (meth !== "constructor") {
      List.prototype[meth] = Enumerator[meth];
    }
  }

  Enum.List = List;

  return Enum;
});