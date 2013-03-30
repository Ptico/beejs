define("base/attribute", ["base/util"], function(util) {
  "use strict";

  var attribute = {};

  /**
   * Simple attribute storage
   */
  var defaultStorage = {
    /**
     * Set attribute
     */
    set: function(obj, key, value) {
      return (obj._attrs[key] = value);
    },

    /**
     * Get attribute
     */
    get: function(obj, key) {
      return obj._attrs[key];
    },

    /**
     * Erase attribute
     */
    erase: function(obj, key) {
      return delete obj._attrs[key];
    },

    /**
     * Erase all attribute
     */
    eraseAll: function(obj) {
      obj._attrs = {};
    },

    /**
     * Get list of keys
     */
    keys: (function() {
      if ("keys" in Object) {
        return function(obj) {
          return Object.keys(obj._attrs);
        };
      } else {
        return function(obj) {
          var keys = [],
              attrs = obj._attrs;

          for (var key in attrs) {
            if (attrs.hasOwnProperty(key)) {
              keys.push(attrs[key]);
            }
          }

          return keys;
        };
      }
    })()
  };

  /**
   * Attribute target
   *
   * Adds or creates attribute functionality
   *
   * @class
   * @param {Object} [options] Options for attributes
   * @param {Boolean}     [options.strict]      Set only configured attributes (default: false) TODO
   * @param {Object}      [options.storage]     Custom storage object/class
   * @param {Object}      [options.validators]  Object which contains validators
   * @param {EventTarget} [options.event]       Object for publishing onchange events TODO
   * @param {String}      [options.eventPrefix] Prefix for events, only usable with options.event setted TODO
   * @param {Object}      [options.presenters]  TODO
   */
  var attrTarget = function(options) {
    var opts;

    this._attrs = this._attrs || {};
    this._attributeOptions = opts = (options || this.prototype._attributeOptions || {});
    this._attrStorage      = opts.storage || defaultStorage;
    this._attrConfig       = {};
    this._attrTracking     = {};
  };

  attrTarget.prototype = {

    /**
     * Configure attribute
     *
     * @param {String} key       Attribute name
     * @param {Object} options   Attribute options
     * @param            [options.defaultVal]  Default value for attribute
     * @param {String}   [options.type]     Attribute type, can be a string, integer, boolean, date, array or object
     * @param {Function} [options.setter]   Setter function for attribute
     * @param {Function} [options.getter]   Getter function for attribute
     * @param            [options.validate] Function, RegExp or custom validator name for validation
     */
    attribute: function(key, options) {
      if (!this._attrs) attrTarget.call(this);

      if (!this._attrConfig[key]) {
        this._attrConfig[key] = options || {};
      } else {
        util.merge(this._attrConfig[key], options);
      }

      return true;
    },

    /**
     * Check for attribute presence
     *
     * @param {String} key Attribute name
     */
    has: function(key) {
      if (!this._attrs) attrTarget.call(this);

      return !!this._attrStorage.get(this, key);
    },

    /**
     * Get attributes list
     *
     * @param {String} key Attribute name
     */
    keys: function(key) {
      if (!this._attrs) attrTarget.call(this);

      return this._attrStorage.keys(this);
    },

    /**
     * Set attribute value
     *
     * @param {String} key Attribute name
     * @param          val Attribute value
     */
    set: function(key, val) {
      if (!this._attrs) attrTarget.call(this);

      var conf    = this._attrConfig[key] || {},
          options = this._attributeOptions;

      if (conf.type) val = util.convert(val, conf.type);

      if (conf.validate) {
        var validate  = conf.validate,
            validType = util.typeOf(validate);

        /*jshint eqeqeq:false */
        if (validType == "regexp") {
          if (!validate.test(val + "")) return false;
        } else if (validType == "function") {
          if (!validate(val)) return false;
        } else if (validType == "string" && options.validators && options.validators[validate]) {
          if (!options.validators[validate].test(val)) return false;
        }
      }

      this._attrTracking[key] = this.get(key);

      if (conf.setter) val = conf.setter.call(this, val);

      return this._attrStorage.set(this, key, val);
    },

    /**
     * Update existing object
     *
     * @param {Object} attributes Object with keys and values for update
     */
    update: function(attributes) {
      for (var key in attributes) {
        this.set(key, attributes[key]);
      }

      return this;
    },

    /**
     * Get attribute value
     *
     * @param {String} key          Attribute name
     * @param          [defaultVal] Default value
     */
    get: function(key, defaultVal) {
      if (!this._attrs) attrTarget.call(this);

      var val,
          conf = this._attrConfig[key] || {};

      val = this._attrStorage.get(this, key) || defaultVal || conf.defaultVal; // FIXME - boolean attribute

      return conf.getter ? conf.getter.call(this, val) : val;
    },

    /**
     * Delete attribute
     *
     * @param {String} key Attribute name
     */
    erase: function(key) {
      if (!this._attrs) attrTarget.call(this);

      return this._attrStorage.erase(this, key);
    },

    /**
     * Delete all attributes
     *
     */
    eraseAll: function() {
      if (!this._attrs) attrTarget.call(this);

      return this._attrStorage.eraseAll(this);
    },

    validate: function() {},

    /**
     * Get previous attribute value
     *
     * @param {String} key Attribute name
     */
    getPrev: function(key) {
      if (!this._attrs) attrTarget.call(this);

      return this._attrTracking[key];
    },

    /**
     * Get attributes for JSON
     */
    toJSON: function() {
      return this._attrs;
    }
  };

  attrTarget.provides = "attribute";

  attribute.Target = attrTarget;

  return attribute;
});