define("base/util", [], function() {
  "use strict";

  var commaReg = /,\s?/;

  var util = {

    /**
     * Extend an object constructor with bee.js module
     *
     * @param {Function} source    Module which provides functionality
     * @param {Function} target    Target constructor
     * @param {Object}   [options] Module options to apply to target
     */
    provide: function(source, target, options) {
      var provides = source.provides;

      util.merge(target.prototype, source.prototype);

      if (provides) {
        if (target.contains && target.contains.length) {
          target.contains.push(provides);
        } else {
          target.contains = [provides];
        }

        if (options) {
          target.prototype["_" + provides + "Options"] = options;
        }
      }
    },

    /**
     * Mixin bee.js module to target instance
     *
     * @param {Function} source    Module which provides functionality
     * @param {Function} target    Target instance
     * @param {Object}   [options] Module options to apply to target instance
     */
    mix: function(source, target, options) {
      var provides = source.provides;

      util.merge(target, source.prototype);

      if (provides) {
        if (util.typeOf(target.provides, "array")) {
          target.contains.push(provides);
        } else {
          target.contains = [provides];
        }
      }

      source.call(target, options);
    },

    /**
     * Merge source property to target object
     *
     * @param {Object} target Target object
     * @param {Object} source Source object
     */
    merge: function(target, source) {
      for (var key in source) {
        if (source.hasOwnProperty(key)) {
          target[key] = source[key];
        }
      }

      return target;
    },

    namespace: function(object, string) {},

    /*jshint eqeqeq:false */
    /**
     * Get real type of object
     * Fix for builtin typeof function, which returns incorrect type for Array, Date, RegExp and null
     * Also returns "NaN" for NaN
     *
     *     util.typeOf(2); //=> "number"
     *     util.typeOf(2, "number"); //=> true
     *     util.typeOf([1, 2]); //=> "array"
     *     util.typeOf(new Date()); //=> "date"
     *     util.typeOf(/\w/); //=> "regexp"
     *     util.typeOf(null); //=> "null"
     *
     * @param          obj    Object to test
     * @param {String} [type] Type for equality test
     */
    typeOf: function(object, type) {
      var result = typeof(object); // typeof is much faster

      if (result == "object") {
        result = Object.prototype.toString.call(object).slice(8, -1).toLowerCase(); // Array, Date, RegExp, null
      }

      if (result == "number" && object !== object) result = "NaN";

      return type ? type == result : result;
    },

    /**
     * Convert given value to the defined type
     *
     *     util.convert(2, "string"); //=> "2"
     *     util.convert([1, 2], String); //=> "1,2"
     *     util.convert("one,two,three", "array"); //=> ["one", "two", "three"]
     *
     * @param                   value Value for convertion
     * @param {String|Function} type  Type to convert
     */
    convert: function(value, type) {
      var valType = util.typeOf(value);

      if (util.typeOf(type) == "function") type = type.name.toLowerCase();

      if (type == valType) return value;

      if (type == "string")  return (valType == "object" ? JSON.stringify(value) : String(value));
      if (type == "number")  return parseFloat(value);
      if (type == "boolean") return !!value;
      if (type == "regexp")  return RegExp(value);
      if (type == "array") {
        if (valType == "number") return [value];
        if (valType == "string" && value.indexOf(",")) return value.split(commaReg);

        return Array(value);
      }
    }
  };

  return util;
});