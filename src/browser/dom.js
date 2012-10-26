define("browser/dom", ["base/enumerable", "vendor/selector"], function(enumerable, selector) {
  "use strict";

  var dom, DOMMethods,
      finder = {},
      win    = window,
      doc    = win.document;

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