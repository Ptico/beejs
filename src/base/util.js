define("base/util", [], function() {
  "use strict";

  var commaReg  = /,\s?/,
      timeReg   = /%([a-z])/ig,
      tzReg     = /^.*\(([^)]+)\)$/,
      yearStart = new Date("Jan 1 " + (new Date()).getFullYear()),
      dateFuncs, nativeDateFuncs;

  // Augment and extend helpers
  function pushOrCreate(target, attr, val) {
    if (target[attr] instanceof Array) {
      if (target[attr].indexOf(val) > -1) return false;

      target[attr].push(val);
    } else {
      target[attr] = [val];
    }

    return true;
  }

  function initAncestors() {
    /*jshint validthis:true */
    var ancestors = this._ancestors,
        proto = Object.getPrototypeOf(this),
        l = ancestors.length,
        i = 0;

    while(i < l) {
      var ancestor = ancestors[i++],
          provides = ancestor.provides,
          options  = provides ? proto['_' + provides + 'DefaultOptions'] : void 0;

      ancestor.call(this, options);
    }
  }

  var util = {

    locale: "en",

    /**
     * Augment an object constructor with bee.js module
     *
     * @param {Function} target    Target constructor
     * @param {Function} source    Module which provides functionality
     * @param {Object}   [options] Module options to apply to target
     */
    augment: function(target, source, options) {
      var provides    = source.provides,
          targetProto = target.prototype;

      if (!target.prototype) throw new Error('Target should be a constructor');

      if (provides) {
        if (!pushOrCreate(targetProto, '_contains', provides)) return;

        if (options) {
          targetProto['_' + provides + 'DefaultOptions'] = options;
        }
      }

      pushOrCreate(targetProto, '_ancestors', source);

      if (!targetProto.hasOwnProperty('_initAncestors')) {
        targetProto._initAncestors = initAncestors;
      }

      util.merge(targetProto, source.prototype);
    },

    /**
     * Extend instance with bee.js module
     *
     * @param {Function} source    Module which provides functionality
     * @param {Function} target    Target instance
     * @param {Object}   [options] Module options to apply to target instance
     */
    extend: function(target, source, options) {
      var provides = source.provides;

      if (provides && !pushOrCreate(target, '_contains', provides)) return;

      util.merge(target, source.prototype);

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

    deepMerge: function(target, source, mutable) {
      var target_is_array = target instanceof Array,
          source_is_array = source instanceof Array,
          dest;

      if (mutable) {
        if (target_is_array && !source_is_array) throw new Error("Object can't be merged into array");
        dest = target;
      } else {
        if (target_is_array && source_is_array) {
          dest = target.slice();
        } else dest = util.merge({}, target);
      }

      if (source_is_array) {
        var i = 0, l = source.length;

        while(i < l) {
          var existing = dest[i],
              val = source[i];

          if (dest[i]) {
            if (typeof val == 'object' && typeof existing == 'object') {
              dest[i] = util.deepMerge(dest[i], val);
            } else if (target_is_array) {
              if (val) {
                dest.push(val);
              }
            } else dest[i] = val;
          } else {
            dest[i] = val;
          }

          i++;
        }
      } else {
        for (var key in source) {
          if (source.hasOwnProperty(key)) {
            if (dest[key] && typeof source[key] == 'object') {
              dest[key] = util.deepMerge(dest[key], source[key]);
            } else dest[key] = source[key];
          }
        }
      }

      return dest;
    },

    delegate: function(source, target /*, arguments*/) {},

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
      if (type == "regexp")  return new RegExp(value);
      if (type == "array") {
        if (valType == "number") return [value];
        if (valType == "string" && value.indexOf(",")) return value.split(commaReg);

        return new Array(value);
      }
    },

    /**
     * Formats date according to the directives in the given format string.
     *
     * %a - The abbreviated weekday name (``Sun'')
     * %A - The  full  weekday  name (``Sunday'')
     * %b - The abbreviated month name (``Jan'')
     * %B - The  full  month  name (``January'')
     * %c - The preferred local date and time representation
     * %d - Day of the month (01..31)
     * %e - Day of the month without leading zeroes (1..31)
     * %H - Hour of the day, 24-hour clock (00..23)
     * %I - Hour of the day, 12-hour clock (01..12)
     * %j - Day of the year (001..366)
     * %k - Hour of the day, 24-hour clock w/o leading zeroes (0..23)
     * %l - Hour of the day, 12-hour clock w/o leading zeroes (1..12)
     * %m - Month of the year (01..12)
     * %M - Minute of the hour (00..59)
     * %p - Meridian indicator (``AM''  or  ``PM'')
     * %P - Meridian indicator (``am''  or  ``pm'')
     * %S - Second of the minute (00..60)
     * %u - Week day as a decimal number (1..7), with 1 representing Monday
     * %U - Week number of the current year,
     *      starting with the first Sunday as the first
     *      day of the first week (00..53)
     * %W - Week  number  of the current year,
     *      starting with the first Monday as the first
     *      day of the first week (00..53)
     * %w - Day of the week (Sunday is 0, 0..6)
     * %x - Preferred representation for the date alone, no time
     * %X - Preferred representation for the time alone, no date
     * %y - Year without a century (00..99)
     * %Y - Year with century
     * %Z - Time zone name
     * %z - Time zone expressed as a UTC offset (``-04:00'')
     * %% - Literal ``%'' character
     *
     *     util.strftime(date, "at %d %b %Y");  //=> "at 10 May 2012"
     *
     * @param {Date}   time   Time to format
     * @param {String} format Format string
     */
    strftime: function(time, format) {
      return format.replace(timeReg, function(match, sub) {
        if (sub in nativeDateFuncs) {
          return time[nativeDateFuncs[sub]]() + "";
        } else {
          return dateFuncs[sub](time);
        }
      });
    }
  };

  /* Stuff for strftime */
  util.locales = {
    en: {
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      dayAbbrs: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      monthAbbrs: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    }
  };

  dateFuncs = {
    A: function(t) { return util.locales[util.locale].days[t.getDay()]; },
    a: function(t) { return util.locales[util.locale].dayAbbrs[t.getDay()]; },
    B: function(t) { return util.locales[util.locale].months[t.getMonth()]; },
    b: function(t) { return util.locales[util.locale].monthAbbrs[t.getMonth()]; },
    d: function(t) { return ("0" + t.getDate()).slice(-2); },
    D: function(t) { return dateFuncs.m(t) + '/' + dateFuncs.d(t) + '/' + dateFuncs.y(t); },
    H: function(t) { return ("0" + t.getHours()).slice(-2); },
    I: function(t) { return ("0" + dateFuncs.l(t)).slice(-2); },
    j: function(t) {
      var ms = (t - new Date('' + t.getFullYear() + '/1/1 GMT')) + t.getTimezoneOffset() * 60000;

      return ("00" + (parseInt(ms/86400000, 10) + 1)).slice(-3);
    },
    l: function(t) {
      var hour = t.getHours();

      if (hour === 0) { hour = 12; } else if (hour > 12) hour -= 12;
      return hour + '';
    },
    m: function(t) { return ("0" + (t.getMonth() + 1)).slice(-2); },
    M: function(t) { return ("0" + t.getMinutes()).slice(-2); },
    p: function(t) { return t.getHours() >= 12 ? 'PM' : 'AM'; },
    P: function(t) { return t.getHours() >= 12 ? 'pm' : 'am'; },
    S: function(t) { return ("0" + t.getSeconds()).slice(-2); },
    U: function(t) { return ("0" + parseInt((parseInt(dateFuncs.j(t), 10) + (6 - t.getDay())) / 7, 10)).slice(-2); },
    u: function(t) { var d = t.getDay(); return d === 0 ? 7 : d; },
    W: function(t) { return ("0" + Math.round((parseInt(dateFuncs.j(t), 10) + (7 - dateFuncs.u(t))) / 7, 10)).slice(-2); },
    y: function(t) { return (t.getFullYear() + "").slice(-2); },
    Z: function(t) { return t.toString().replace(tzReg, '$1'); },
    z: function(t) {
      var offset = t.getTimezoneOffset();
      return (offset >= 0 ? "-" : "") + ("0" + (offset / 60)).slice(-2) + ":" + ("0" + (offset % 60)).slice(-2);
    }
  };

  nativeDateFuncs = {
    c: "toLocaleString",
    e: "getDate",
    k: "getHours",
    w: "getDay",
    x: "toLocaleDateString",
    X: "toLocaleTimeString",
    Y: "getFullYear"
  };

  return util;
});