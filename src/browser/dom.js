define("browser/dom", ["base/enumerable", "vendor/selector"], function(enumerable, selector) {
  "use strict";

  var dom, DOMMethods,
      finder = {},
      win    = window,
      doc    = win.document,
      spaceReg = /[\n\t\r]/g;

  // Set selector engine
  if (selector.name && selector.name === "Sizzle") { // Sizzle
    finder.search = selector;
  } else if (selector.search !== void 0) { // Slick
    finder.search = function(stor, context, results) {
      return selector.search(context, stor, results);
    };
  }

  /**
   * Main DOM helper
   *
   *     dom(".special");
   *     dom(el.parent);
   *
   * @param {String|DOMElement|DomWrapper} stor     CSS-selector string or plain DOMElement or Wrapper object
   * @param {DOMElement}                   context  Context for lookup
   *
   * @returns {Wrapper} Wrapped set of DOMElements
   */
  dom = function(stor, context) {
    if (stor.wrapped) return selector;

    var result;

    if (typeof stor === "string") {
      if (!context) context = doc;
      result = finder.search(stor, context);
    } else if (stor.nodeType) {
      result = stor;
    }

    return new DOMWrapper(result);
  };

  /**
   * Wrapper for DOM elements
   *
   * Wraps array of DOMElements to enumerable object with built-in DOM functions
   *
   * @class
   * @param {Array} nodes Array of nodes
   */
  function DOMWrapper(nodes) {
    // Hide length from enums if possible
    if (Object.defineProperty !== void 0) {
      Object.defineProperty(this, "length", {
        writable: true,
        enumerable: false,
        configurable: false,
        value: 0
      });
    }

    if (!nodes) return;
    if (nodes.wrapped) return nodes;

    var i = 0, len = nodes.length,
        result = [],
        node, nodeType;

    if (nodes.nodeType) {
      nodes = [nodes];
      len = 1;
    }

    // Filter non-tag elements
    while (i < len) {
      node = nodes[i++];
      nodeType = node.nodeType;

      if (nodeType == 1 || nodeType == 9 || nodeType == 11) {
        result.push(node);
      }
    }

    this.push.apply(this, result);
  }

  // Make DOMWrapper enumerable first (because we can't just copy Array prototype methods)
  var Copy = function() {};
  Copy.prototype = enumerable.List.prototype;
  DOMWrapper.prototype = new Copy();

  // Define DOM functions
  DOMMethods = {
    constructor: DOMWrapper,

    find: function(stor) {
      var i = 0, len = this.length, result = [];

      while (i < len) {
        finder.search(stor, this[i++], result);
      }

      return new DOMWrapper(result);
    },

    /* == Class operations == */

    /**
     * Check presence of class name in elements
     *
     *     dom("#example").hasClass("test");
     *
     * @param {String} className Class name to search
     */
    hasClass: function(className) {
      className = " " + className + " ";

      var len = this.length,
          result = new Array(len);

      for (var i = 0; i < len; i++) {
        result[i] = this[i].className;
      }

      return (" " + result.join(" ") + " ").replace(spaceReg, " ").indexOf(className) > -1;
    },

    /**
     * Add class name(s) to each element
     *
     * TODO: optimize this method
     *
     *     dom("#example").addClass("foo");
     *     dom("#example").addClass("foo bar");
     *     dom("#example").addClass(["bar", "foo"]);
     *     dom("#example").addClass("bar", "foo");
     *
     * @param {String|Array} className Class name, or array of class names or space-separated list of class names
     */
    addClass: function(className) {
      var i = 0, len = this.length, cLen, names;

      if (className instanceof Array) { // Array or Enumerable
        names = className;
      } else if (arguments.length > 1) { // Arguments list
        names = arguments;
      } else if (typeof(className) === "string") { // Single class name or space-separated list
        names = className.split(" ");
      } else return this; // Bullshit given

      cLen = names.length;

      while (i < len) {
        var el = this[i++], j = 0, result = [],
            classes = (" " + el.className + " ").replace(spaceReg, " ");

        while (j < cLen) {
          var val = names[j++], name = " " + val + " ";

          if (classes.indexOf(name) === -1) result.push(val);
        }

        if (result.length > 0) el.className = (classes + result.join(" ")).slice(1);
      }

      return this;
    },

    /**
     * Remove class name(s) from each element
     *
     *     dom("#example").removeClass("foo");
     *     dom("#example").removeClass("foo bar");
     *     dom("#example").removeClass(["bar", "foo"]);
     *     dom("#example").removeClass("bar", "foo");
     *
     * @param {String|Array} className Class name, or array of class names or space-separated list of class names
     */
    removeClass: function(className) {
      var i = 0, len = this.length, cLen, names;

      if (className instanceof Array) { // Array or Enumerable
        names = className;
      } else if (arguments.length > 1) { // Arguments list
        names = arguments;
      } else if (typeof(className) === "string") { // Single class name or space-separated list
        names = className.split(" ");
      } else return this;

      cLen = names.length;

      while (i < len) {
        var el = this[i++], j = 0,
            classes = (" " + el.className + " ").replace(spaceReg, " ");

        while (j < cLen) {
          var val = names[j++], name = " " + val + " ";

          classes = classes.replace(name, " ");
        }

        el.className = classes.slice(1, -1);
      }

      return this;
    },

    wrapped: true
  };

  for (var meth in DOMMethods) {
    DOMWrapper.prototype[meth] = DOMMethods[meth];
  }

  dom.Wrapper = DOMWrapper;

  /**
   * Get element by id and wrap it with DOMWrapper
   *
   * Uses getElementById for lookup instead of more slower selector engine
   *
   *     dom.id("main");
   *
   * @param {String} id DOM identifier
   */
  dom.id = function(id) {
    return new DOMWrapper(doc.getElementById(id));
  };

  /**
   * Cached window.document
   */
  dom.root = new DOMWrapper(doc);

  return dom;
});