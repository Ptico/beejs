define("browser/dom", ["base/enumerable", "vendor/selector"], function(enumerable, selector) {
  "use strict";

  var dom, DOMMethods,
      finder, matcher,
      yep    = true, // Try to save couple bytes :)
      win    = window,
      doc    = win.document,
      spaceReg = /[\n\t\r]/g,
      inserts = ["bottom", "top", "before", "after"],
      booleans, camels, props, customAttrs;

  // Set selector engine
  if ("matchesSelector" in selector) { // Sizzle
    finder  = selector;
    matcher = selector.matchesSelector;
  } else if ("lookupPseudo" in selector) { // Slick
    finder = function(stor, context, results) {
      return selector.search(context, stor, results);
    };
    matcher = selector.match;
  }

  /**
   * Main DOM helper
   *
   *     dom(".special");
   *     dom(el.parent);
   *
   * @param {String|Node|DomWrapper} stor  CSS-selector string or plain DOM node or Wrapper object
   * @param {Node}                   context  Context for lookup
   *
   * @returns {Wrapper} Wrapped set of DOM nodes
   */
  dom = function(stor, context) {
    if (stor.wrapped) return selector;

    var result;

    if (typeof stor == "string") {
      if (!context) context = doc;
      result = finder(stor, context);
    } else if (stor.nodeType) {
      result = stor;
    }

    return new DOMWrapper(result);
  };

  /**
   * Wrapper for DOM nodes
   *
   * Wraps array of DOM nodes to enumerable object with built-in DOM functions
   *
   * @class
   * @param {Array} nodes Array of nodes
   */
  function DOMWrapper(nodes) {
    // Hide length from enums if possible
    Object.defineProperty(this, "length", {
      writable: true,
      enumerable: false,
      configurable: false,
      value: 0
    });

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

  // DOM-properties
  props = {
    'html':  'innerHTML',
    'class': 'className',
    'for':   'htmlFor',
    'text':  'textContent'
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

            opt.selected = valueArr.indexOf(optVal) > -1;
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

  function nodeCollect(nodes, prop, last, num, stor) {
    var result = new DOMWrapper(),
        len = nodes.length,
        i = 0, index;

    num = parseInt(num, 10) || 9000;
    index = num - 1;

    while (i < len) {
      var j = 0,
          newNode = nodes[i++][prop];

      while (newNode && j < num) {
        var nodeType = newNode.nodeType;

        if (nodeType === 9 || nodeType === 11) break;
        if (nodeType === 1) {
          if (stor && matcher(newNode, stor) || !stor) {
            if (!last || (num - 1 === j)) result.push(newNode);
            j++;
          }
        }

        newNode = newNode[prop];
      }
    }

    return result;
  }

  function parseHTML(string) {
    var container = doc.createElement('div'),
        fragment  = doc.createDocumentFragment(),
        nodes;

    container.innerHTML = string;
    nodes = container.childNodes;
    for (var i=0, l = nodes.length; i < l; i++) {
      fragment.appendChild(nodes[0]);
    }
    container = null;
    return fragment;
  }

  /////////////////////////////////////////////
  /////////////////////////////////////////////
  /////////// DOM WRAPPER METHODS /////////////
  /////////////////////////////////////////////
  /////////////////////////////////////////////
  DOMMethods = {
    constructor: DOMWrapper,


    /*
    ==========================================
    ============ Common functions ============
    ==========================================
    */

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
        finder(stor, this[i++], result);
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


    /*
    ==========================================
    ============ Class operations ============
    ==========================================
    */

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
      } else if (typeof(className) == "string") { // Single class name or space-separated list
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
      } else if (typeof(className) == "string") { // Single class name or space-separated list
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


    /*
    ==========================================
    ========== Attribute operations ==========
    ==========================================
    */

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


    /*
    ==========================================
    =============== Traversing ===============
    ==========================================
    */

    /**
     * Get all or `num` parents of the element
     *
     *     dom(".children").parents();
     *     dom(".children").parents(3);
     *
     * @param {Number} [num] Number of result
     */
    parents: function(num) {
      return nodeCollect(this, "parentNode", false, num);
    },

    /**
     * Get first level childrens for each element
     *
     *     dom(".parent").childrens();
     *     dom(".parent").childrens("li");
     *
     * @param {String} [stor] CSS-selector string
     */
    childrens: function(stor) {
      stor = stor || "*";
      return this.find("> " + stor);
    },

    /**
     * Get all siblings or sibling matches CSS-selector string
     *
     *     dom("#example").siblings();
     *     dom("#example").siblings(".tab");
     *
     * @param {String} [stor] CSS-selector string
     */
    siblings: function(stor) {
      return this.up().childrens(stor);
    },

    /**
     * Get index for the first element in collection
     *
     *     dom("#example").index();
     *     dom("#example").index("li");
     *
     * @param {String} CSS-selector string
     */
    index: function(stor) {
      var el = this[0],
          wrapped = (this.length > 1) ? new DOMWrapper(el) : this,
          siblings = wrapped.up().childrens(stor),
          i = -1, len = siblings.length;

      while (i++ < len) if (siblings[i] == el) return i;

      return -1;
    },

    /**
     * Get first parent by condition for each element
     *
     * If condition is number - get (n)th parent
     * If condition is css selector - get first parent that matches given selector
     * If condition is not given - return just first parent
     *
     *     dom(".children").up();
     *     dom(".children").up(2);
     *     dom(".children").up(".grandparent");
     *
     * @param {Number|String} cond Number of parent or selector
     */
    up: function(cond) {
      cond = cond || 0;

      var byInd = typeof(cond) == "number",
          result = new DOMWrapper(),
          nodes = this,
          len = nodes.length,
          i = 0;

      while (i < len) {
        var newNode = nodes[i++],
            j = 0;

        /*jshint boss:true */
        while (newNode = newNode.parentNode) {
          var type = newNode.nodeType;
          if (type === 9 || type === 11) {
            result.push(null);
            break;
          }

          if ((byInd && cond === j++) || (!byInd && matcher(newNode, cond))) {
            result.push(newNode);
            break;
          }
        }
      }

      return result;
    },

    /**
     * Get first or (n)th descendant
     *
     *     dom(".parent").down();
     *     dom(".parent").down(2);
     *     dom(".parent").down(1, 0, 2);
     */
    down: function() {
      var result = new DOMWrapper(),
          argLen = arguments.length,
          nodes  = this,
          len = nodes.length,
          i = 0,
          lastIndex,
          args;

      if (argLen > 0) {
        args = arguments;
      } else {
        args = [0];
        argLen = 1;
      }

      lastIndex = argLen - 1;

      while (i < len) { // Iterate through DOM-Elements
        var currNode = nodes[i++],
            j = 0, childNodes, arg;

        while (currNode && j < argLen) { // Iterate through arguments
          childNodes = finder("> *", currNode);
          arg = args[j];

          currNode = childNodes[arg];

          if (j === lastIndex) result.push(currNode); // Last argument
          j++;
        }
      }

      return result;
    },

    /**
     * Get next sibling of each element
     *
     * If first argument is a CSS selector string - get next sibling matched by selector
     * If first argument is a number - get next (n)th sibling
     * If both arguments given - get next (n)th sibling matched by selector
     *
     *     dom("#example").next(); // Get next sibling
     *     dom("#example").next(2); // Get third right sibling
     *     dom("#example").next(".tab"); // Get next sibling with class `tab`
     *     dom("#example").next(".tab", 2); // Get third right sibling with class `tab`
     *
     * @param {String|Number} [stor]  CSS-selector string or index in sibling list
     * @param {Number}        [index] Index in siblings list
     */
    next: function(stor, index) {
      if (typeof(stor) != "string") {
        index = stor;
        stor = void 0;
      }

      if (index === void 0) {
        index = 0;
      }

      return nodeCollect(this, "nextSibling", true, index + 1, stor);
    },

    /**
     * Get previous sibling of each element
     *
     * If first argument is a CSS selector string - get previous sibling matched by selector
     * If first argument is a number - get previous (n)th sibling
     * If both arguments given - get previous (n)th sibling matched by selector
     *
     *     dom("#example").next(); // Get previous sibling
     *     dom("#example").next(2); // Get third left sibling
     *     dom("#example").next(".tab"); // Get previous sibling with class `tab`
     *     dom("#example").next(".tab", 2); // Get third left sibling with class `tab`
     *
     * @param {String|Number} [stor]  CSS-selector string or index in sibling list
     * @param {Number}        [index] Index in siblings list
     */
    prev: function(stor, index) {
      if (typeof(stor) != "string") {
        index = stor;
        stor = void 0;
      }

      if (index === void 0) {
        index = 0;
      }

      return nodeCollect(this, "previousSibling", true, index + 1, stor);
    },


    /*
    ==========================================
    ============ DOM Manipulation ============
    ==========================================
    */

    /**
     * Insert element(s) `before`, `after`, on `top` or to the `bottom` of the given collection
     *
     * Elements to insert can be given in four formats:
     * * `String` - an HTML-string, which will be rendered
     * * `Node` - plain DOM node
     * * `DocumentFragment` - document fragment with nodes inside
     * * `DOMWrapper` - wrapped result of work of this library
     *
     * IMPORTANT!
     * To avoid ID collisions, if collection have more than one target element,
     * existing node will be cloned and their ID will be removed. Otherwise,
     * node will be just moved to the new place
     *
     * If only target element given - it will be appended by default
     * If `where` is a string and `insertion` is an element - `insertion` will be inserted to the `where` position
     * If `where` is an object - it will be processed as list where key is position and value is element to insert
     *
     *     dom("#example").insert("top", "<h1>This is a header<h1>"); // Prepend node
     *     dom("#example").insert("bottom", dom(".footer")); // Append node
     *     dom("#example").insert("before", document.createElement("div")); // Insert element before the target
     *     dom("#example").insert("after", docFragmentWithEls); // Insert element after the target
     *
     *     dom("#example").insert(dom(".footer")); // Append element
     *     dom("#example").insert({ top: "<h1>Hello</h1>", after: "" }); // Mass insert
     *
     * @param {String|Object} where Place to insert the element or list of insertions
     * @param {Node|DOMWrapper|Node|DocumentFragment} [insertion] Element to insert to collection
     */
    insert: function(where, insertion) {
      var objs = {}, nodes = this,
          whereType = typeof(where),
          i = nodes.length, j = 4,
          multInsert = i > 1,
          insTypes = [], insTypesLen;

      if (insertion === void 0) {
        if (where.wrapped || where.nodeType || whereType == "string") {
          objs = { 'bottom': where };
        } else if (whereType == "object") {
          objs = where;
        } else return this;
      } else if (whereType == "string") {
        objs[where] = insertion;
      } else return this;

      while (j--) { // Normalize insertions
        var key = inserts[j],
            ins = objs[key];

        if (ins) {
          if (ins.wrapped) {
            if (multInsert) ins.clean(true);

            objs[key] = ins.toFragment();
          } else if (typeof(ins) == "string") {
            objs[key] = parseHTML(ins);
          }

          insTypes.push(key);
        }
      }

      insTypesLen = insTypes.length;

      while (i--) {
        var el = nodes[i],
            k = insTypesLen;

        while (k--) {
          var type = insTypes[k],
              fragment = multInsert ? objs[type].cloneNode(true) : objs[type],
              parent;

          if (type == "before") {
            parent = el.parentNode;
            if (parent) parent.insertBefore(fragment, el);
          } else if (type == "after") {
            parent = el.parentNode;
            if (parent) parent.insertBefore(fragment, el.nextSibling);
          } else if (type == "bottom") {
            el.appendChild(fragment);
          } else { // top
            el.insertBefore(fragment, el.firstChild);
          }
        }
      }

      return this;
    },

    empty: function() {
      var nodes = this, i = nodes.length;

      while (i--) {
        nodes[i].innerHTML = "";
      }

      return this;
    },

    /**
     * Destroy all elements in collection
     *
     *     dom(".example").destroy();
     *     dom(".example").remove();
     */
    destroy: function() {
      var el;

      /*jshint boss:true */
      while (el = this.shift()) {
        var parent = el.parentNode;

        if (parent) parent.removeChild(el);
      }

      return this;
    },


    /*
    ==========================================
    =============== Internals ================
    ==========================================
    */

    clone: function(deep) {
      var nodes = this,
          i = nodes.length, result = new DOMWrapper(i);

      while (i--) result[i] = nodes[i].cloneNode(deep);

      result.clean(deep);

      return result;
    },

    clean: function(deep) {
      var nodes = this, i = nodes.length;

      while (i--) {
        var el = nodes[i],
            type = el.type;

        el.removeAttribute("id");
      }

      if (deep) this.find("[id], input").clean();

      return this;
    },

    toFragment: function() {
      var nodes = this, i = 0, len = nodes.length,
          result = doc.createDocumentFragment();

      while (i < len) result.appendChild(nodes[i++]);

      return result;
    },

    wrapped: true
  };

  // Make wrapper available for public usage
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

  /**
   * Setup custom attribute
   *
   *     dom.attribute("broText", {
   *       get: function(el) { return el.innerText + " bro!"; },
   *       set: function(el, val) { el.innerText = "Bro, " + val; }
   *       erase: function(el) { el.innerText = el.innerText.replace(/bro/i, ""); }
   *     });
   *
   * @param {String} attr    Attribute name
   * @param {Object} options Attibute getter/setter/eraser
   */
  dom.attribute = function(attr, options) {
    customAttrs[attr] = options;
  };

  /**
   * Implement custom methods for DOM wrapper
   *
   *     dom.implement({
   *       inspect: function() { this.each(function(el) { console.log(el); }); }
   *     });
   *
   *     dom(".example").inspect(); // Will display all elements in the console
   *
   * @param {Object} methods List of methods where key is method name and value is a function
   */
  dom.implement = function(methods) {
    for (var meth in methods) {
      if (methods.hasOwnProperty(meth)) {
        DOMWrapper.prototype[meth] = methods[meth];
      }
    }
  };

  dom.finder = finder;
  dom.matcher = matcher;

  // Implement basic DOM methods
  dom.implement(DOMMethods);

  // Setup synonyms
  dom.implement({
    remove: DOMMethods.destroy,
    clear:  DOMMethods.empty
  });

  return dom;
});