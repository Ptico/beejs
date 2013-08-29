define("browser/event", ["browser/dom"], function(dom) {
  "use strict";

  var win  = window,
      doc  = win.document,
      html = doc.documentElement,
      body = doc.body,
      console = win.console,
      // DomLoad
      domLoaded = false,
      domLoadCallbacks = [],
      domLoadHandler,
      domLoadCallbacksAttached = false;

  function createEventHandler(element, delegate) {
    return function(event) {
      dispatchEvent(event, element, delegate);
    };
  }

  function fixEvent(event, element) {
    event = event || win.event;

    if (event.target && event.target.nodeType === 3) event.target = event.target.parentNode; // Safari. TODO - check if bug resolved and remove this

    if (event.pageX === null && event.clientX !== null) {
      event.pageX = event.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html && html.clientLeft || body && body.clientLeft || 0);
      event.pageY = event.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html && html.clientTop || body && body.clientTop || 0);
    }

    event.stop = function() {
      event.preventDefault(event);
      event.stopPropagation(event);
      event.stopped = true;
    };
    if (!event.preventDefault)  event.preventDefault  = function() { event.returnValue = false; };
    if (!event.stopPropagation) event.stopPropagation = function() { event.cancelBubble = true; };

    return event;
  }

  function dispatchEvent(event, element, delegate) {
    fixEvent(event, element);

    var target = event.target;

    if ((!delegate && target !== element) || delegate && !dom.matcher(target, delegate)) return;

    var type = event.type, events = element.events,
        handlers = events[type],
        i = 0, len = handlers.length, rest = [];

    while (i < len) {
      var handler = handlers[i++],
          returnValue;

      try {
        returnValue = handler.fn.call(handler.context, event, element);
      } catch(e) {
        if (console && console.error) console.error(e.stack || e.message || e);
      }

      if (!handler.once) rest.push(handler);

      if (returnValue === false) {
        event.preventDefault();
        event.stopPropagation();
      }

      if (event.stopped) break;
    }

    if (rest.length < 1) {
      unloadEvent(element, type);
    } else {
      events[type] = rest;
    }
  }

  function unloadEvent(element, type) {
    delete element.events[type];

    element.removeEventListener(type, element.eventHandler, false);
  }

  dom.implement({
    /**
     * Add event listener to each element
     *
     *     dom(".example").on("click", function(ev, el) { el.className = "test"; });
     *     dom("#main").on("click", ".example", doSmthng); // Delegation
     *     dom(".example").on("click", doSmthng, { a: "b" }); // Bind `this`
     *
     * @param {String}   type      Event type
     * @param {Function} callback  Callback function to add
     * @param {Object}   [context] Context for using as `this` in callback
     * @param {Boolean}  [once]    Callback should fire once?
     */
    on: function(type, callback, context, once) {
      var nodes = this, i = nodes.length, delegate = false;

      if (typeof(callback) == "string") {
        delegate = callback;
        callback = context;
        context  = once;
        once     = arguments[4];
      }

      while (i--) {
        var el = nodes[i],
            handler = { fn: callback, context: context || el };

        if (once) handler.once = true;
        if (delegate) handler.delegate = delegate;

        if (!el.events) el.events = {};
        if (!el.eventHandler) el.eventHandler = createEventHandler(el, delegate);

        if (!el.events[type]) {
          el.events[type] = [handler];

          el.addEventListener(type, el.eventHandler, false);
        } else {
          el.events[type].push(handler);
        }
      }

      return this;
    },

    /**
     * Add event listener and remove after first call
     *
     *     dom(".example").once("click", doSmthng);
     *
     * @param {String} type Event type
     * @param {Function} callback Listener function to add
     */
    once: function(type, callback, context) {
      if (typeof(callback) == "string") {
        return this.on(type, callback, context, arguments[4], true);
      } else {
        return this.on(type, callback, context, true);
      }
    },

    /**
     * Dispatch event for each element
     *
     *     dom(".example").fire("click");
     *
     * @param {String} type Event type
     */
    fire: function(type) {
      var nodes = this, i = 0, len = nodes.length;

      while (i < len) {
        var el = nodes[i++],
            event;

        event = doc.createEvent('HTMLEvents');
        event.eventName = type;
        event.initEvent(type, true, true);
        el.dispatchEvent(event);
      }

      return this;
    },

    /**
     * Detach event listener
     *
     * If callback function passed - remove only callback
     * else - detach whole event
     *
     *     dom(".example").off("click", doSmthng);
     *     dom(".example").off("click");
     *     dom("#main").off("click", ".example", doSmthngDelegated);
     *     dom("#main").off("click", ".example");
     *
     * @param {String}   type       Event name
     * @param {Function} [callback] Callback to detach
     */
    off: function(type, callback) {
      var nodes = this, i = nodes.length, delegate = false;

      if (typeof(callback) == "string") {
        delegate = callback;
        callback = arguments[2];
      }

      while (i--) {
        var el = nodes[i], events = el.events;

        if (events && events[type]) {
          var handlers = events[type], j = handlers.length;

          if (callback) {
            while (j--) {
              var handler = handlers[j];

              if (handler.fn === callback) {
                if (delegate && handler.delegate === delegate || !delegate) handlers.splice(j, 1);
              }
            }

            if (handlers.length < 1) unloadEvent(el, type);
          } else if (delegate) {
            while (j--) if (handlers[j].delegate === delegate) handlers.splice(j, 1);

            if (handlers.length < 1) unloadEvent(el, type);
          } else {
            unloadEvent(el, type);
          }
        }
      }

      return this;
    }

  });

  domLoadHandler = function() {
    if (!domLoaded) {
      var len = domLoadCallbacks.length, i = 0;

      doc.removeEventListener("DOMContentLoaded", domLoadHandler, false);
      win.removeEventListener("load", domLoadHandler, false);

      while (i < len) {
        var handler = domLoadCallbacks[i++];

        try {
          handler.fn.call(handler.context);
        } catch(e) {
          if (console && console.error) console.error(e.stack || e.message || e);
        }
      }

      domLoaded = true;
    }
  };

  /**
   * Add listeners which will be executed when the DOM-Structure is ready
   *
   *     dom.ready(function() { alert("DOM is ready"); });
   *
   * @param {Function} callback  Callback function to add
   * @param {Object}   [context] Context for using as `this` in callback
   */
  dom.ready = function(callback, context) {
    if (domLoaded) {
      callback.call(context || doc);
      return;
    }

    domLoadCallbacks.push({ fn: callback, context: context });

    // Check if document REALLY complete (IE enters "interactive" mode to early). Thnx @mikesherov
    if (doc.readyState === "complete" ||
        (!doc.attachEvent && doc.readyState === "interactive")) setTimeout(domLoadHandler, 1);

    if (!domLoadCallbacksAttached) {
      doc.addEventListener("DOMContentLoaded", domLoadHandler, false);
      win.addEventListener("load", domLoadHandler, false);

      domLoadCallbacksAttached = true;
    }
  };

  return dom;
});