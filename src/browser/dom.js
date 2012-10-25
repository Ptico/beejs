define("browser/dom", ["base/enumerable", "vendor/finder"], function(enumerable, finder) {
  "use strict";

  var dom, DOMMethods;

  /**
   * Main DOM helper
   *
   *     dom(".special");
   *     dom(el.parent);
   *
   * @param {String|DOMElement|DomWrapper} selector CSS-selector string or plain DOMElement or Wrapper object
   * @param {DOMElement}                   context  Context for lookup
   *
   * @returns {Wrapper} Wrapped set of DOMElements
   */
  dom = function(selector, context) {
    if (selector.wrapped) return selector;

    var result;

    if (typeof selector === "string") {
      if (!context) context = doc;
      result = finder.search(context, selector);
    } else if (selector.nodeType) {
      result = selector;
    }

    return new Wrapper(result);
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

    var i = 0,
        len = nodes.length,
        result = [],
        node,
        nodeType;

    if (nodes.nodeType) {
      nodes = [nodes];
      len = 1
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
  };

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

  return dom;
});