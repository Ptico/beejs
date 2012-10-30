define("browser/dom", ["base/enumerable", "vendor/selector"], function(enumerable, selector) {
  "use strict";

  var dom, DOMMethods, inArray,
      finder = {},
      yep    = true, // Try to save couple bytes :)
      win    = window,
      doc    = win.document,
      spaceReg = /[\n\t\r]/g,
      booleans, camels, attrParamFix, props, customAttrs;

  // IE compatible inArray
  if (!Array.prototype.indexOf) {
    inArray = function(val, arr) {
      var l = arr.length,
          i = 0;

      while(i < l) {
        if (arr[i++] === val) return yep;
      }
      return false;
    };
  } else {
    inArray = function(val, arr) {
      return Array.prototype.indexOf.call(arr, val) > -1;
    };
  }

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

  /* == Helpers for attributes == */

  // List of boolean attributes http://www.thoughtresults.com/html5-boolean-attributes
  booleans = {
    "checked"        : yep,
    "disabled"       : yep,
    "autoplay"       : yep,
    "async"          : yep,
    "autofocus"      : yep,
    "controls"       : yep,
    "default"        : yep,
    "defer"          : yep,
    "formnovalidate" : yep,
    "hidden"         : yep,
    "ismap"          : yep,
    "itemscope"      : yep,
    "loop"           : yep,
    "multiple"       : yep,
    "noresize"       : yep,
    "novalidate"     : yep,
    "open"           : yep,
    "pubdate"        : yep,
    "readonly"       : yep,
    "required"       : yep,
    "reversed"       : yep,
    "scoped"         : yep,
    "seamless"       : yep,
    "selected"       : yep
  };

  // Fix property names
  camels = {
    tabindex        : "tabIndex",
    readonly        : "readOnly",
    maxlength       : "maxLength",
    cellspacing     : "cellSpacing",
    cellpadding     : "cellPadding",
    rowspan         : "rowSpan",
    colspan         : "colSpan",
    usemap          : "useMap",
    frameborder     : "frameBorder",
    contenteditable : "contentEditable"
  };

  // Attributes which needs additional param for getAttribute in IE
  attrParamFix = {
    width:  yep,
    height: yep,
    src:    yep,
    href:   yep
  };

  // DOM-properties
  props = {
    'html':  'innerHTML',
    'class': 'className',
    'for':   'htmlFor',
    'text':  (function() {
      var temp = doc.createElement('div');
      return (temp.textContent === null) ? 'innerText' : 'textContent';
    })()
  };

  // Getters/setters for non-standart properties
  customAttrs = {
    style: {
      get: function(el) {
        return el.style.cssText.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); // TODO - find more faster regexp
      },
      set: function(el, val) {
        el.style.cssText = val;
      },
      erase: function(el) {
        el.style.cssText = '';
      }
    },
    value: {
      get: function(el) {
        var tagName = el.nodeName.toLowerCase();

        if (tagName === "button") {
          return el[props.text];
        } else if (tagName === "select") {
          var single   = el.type === "select-one",
              selected = el.selectedIndex,
              options  = el.options,
              i = single ? selected : 0,
              l = single ? selected + 1 : options.length,
              result = [];

          while(i < l) {
            var option = options[i++];

            if (option.selected && !option.disabled) { // TODO - more complex check
              result.push(customAttrs.value.get(option));
            }
          }

          return single ? result[0] : result;
        } else if (tagName === "option") {
          var val = el.attributes.value;

          return !val || val.specified ? el.value : el.text;
        } else return el.value;
      },
      set: function(el, val) {
        var tagName = el.nodeName.toLowerCase();

        if (tagName === "button") {
          el[props.text] = val;
        } else if (tagName === "select") {
          var valueArr = val.constructor === Array ? val : [val + ""],
              options  = el.options,
              i = 0, l = options.length;

          while(i < l) {
            var opt    = options[i++],
                optVal = opt.attributes.value;

            optVal = (!optVal || optVal.specified) ? opt.value : opt.text;

            opt.selected = inArray(optVal, valueArr);
          }
        } else el.value = val;
      }
    },
    tag: {
      get: function(el) {
        return el.nodeName.toLowerCase();
      }
    }
  };

  // Define DOM functions
  DOMMethods = {
    constructor: DOMWrapper,

    /**
     * Find elements by selector
     *
     *     dom(".hello").find(".world");
     *
     * @param {String} stor CSS-selector string
     */
    find: function(stor) {
      var i = 0, len = this.length, result = [];

      while (i < len) {
        finder.search(stor, this[i++], result);
      }

      return new DOMWrapper(result);
    },

    /**
     * Get wrapped element by index
     *
     * @param {Integer} index Index of element
     */
    eq: function(index) {
      var len      = this.length - 1,
          position = (index > len) ? len : (index < 0) ? 0 : index;

      return new DOMWrapper(this[position]);
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

    /* == Attribute operations == */

    /**
     * Universal getter for attributes/properties
     *
     *     dom("#search").get("value");
     *     dom("#content p").get("text");
     *     dom(".popup").get("tag");
     *     dom(".options").get("checked");
     *
     * Function to get any attribute/property of an element or collection of elements
     * Also it gets custom properties defined by `dom.addProperty()` function
     *
     * @param {String} attr Attribute or property to get
     */
    get: function(attr) {
      var len    = this.length, i = len, result = new Array(len),
          custom = (customAttrs[attr] && customAttrs[attr].get),
          bool   = !!booleans[attr];

      if (camels[attr]) attr = camels[attr];

      if (custom) {
        while (i--) result[i] = customAttrs[attr].get(this[i]) || "";
      } else if (props[attr]) {
        while (i--) result[i] = this[i][props[attr]];
      } else if (attrParamFix[attr]) {
        while (i--) result[i] = this[i].getAttribute(attr, 2) || "";
      } else if (bool) {
        while (i--) result[i] = !!this[i][attr];
      } else {
        while (i--) result[i] = this[i].getAttribute(attr) || "";
      }

      return (len > 1) ? result : result[0];
    },

    /**
     * Universal setter for attributes/properties
     *
     *     dom("#username").set("value", "ptico");
     *     dom("#results").set("html", "<b>There is no results here</b>");
     *     dom(".current").set("style", "color: black;");
     *
     * @param {String} attr  Attribute or property to get
     * @param          value Value which will be assigned to attribute
     */
    set: function(attr, value) {
      var len     = this.length, i = len,
          custom  = (customAttrs[attr] && customAttrs[attr].set),
          bool    = !!booleans[attr],
          boolVal = !!value;

      if (camels[attr]) attr = camels[attr];

      if (custom) {
        while (i--) customAttrs[attr].set(this[i], value);
      } else if (props[attr]) {
        while (i--) this[i][props[attr]] = value;
      } else if (bool) {
        while (i--) this[i][attr] = boolVal;
      } else {
        while (i--) this[i].setAttribute(attr, value);
      }

      return this;
    },

    /**
     * Erase attribute/property
     *
     *     dom("#username").erase("value");
     *     dom("#results").erase("html");
     *
     * @param {String} attr Attribute or property to erase
     */
    erase: function(attr) {
      var len     = this.length, i = len,
          custom  = (customAttrs[attr] && customAttrs[attr].erase);

      if (camels[attr]) attr = camels[attr];

      if (custom) {
        while (i--) customAttrs[attr].erase(this[i]);
      } else {
        this.set(attr, "");

        if (!props[attr]) {
          while (i--) {
            var el = this[i];
            el.removeAttributeNode(el.getAttributeNode(attr));
          }
        }
      }
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