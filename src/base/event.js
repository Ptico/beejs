define("base/event", [], function() {
  "use strict";

  var baseEvent, EventListener, EventTarget;

  function merge(target, source) {
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
  }

  /**
   * Add event facade like:
   * http://www.w3.org/TR/DOM-Level-3-Events/#interface-Event
   *
   * @private
   * @param {Object} event     Object to add
   * @param {String} type      Event name
   * @param {String} target    Event target
   * @param {Object} [options] Event options
   */
  function addFacade(event, type, target, options) {
    event = event || {};

    if (!event.bubbles) {
      var opts = options || target._eventOptions || {};

      event.type   = opts.prefix ? (opts.prefix + ":" + type) : type;
      event.target = target;

      event.bubbles          = false;
      event.stopped          = false;
      event.defaultPrevented = false;
      event.cancelBubble     = false;

      event.stop            = function() { event.stopped = true; };
      event.preventDefault  = function() { event.defaultPrevented = true; };
      event.stopPropagation = function() { event.cancelBubble = true; };
    } else {
      event.currentTarget = target;
    }

    return event;
  }

  /**
   * Event listener
   * Container and dispatcher for event callbacks
   *
   * @class
   * @param {Object}   [options]           Options for generic event
   * @param {Function} [options.defaultFn] Default function for event
   */
  EventListener = function(options) {

    /**
     * Options
     *
     * @type Object
     */
    this.options = options || {};

    /**
     * Handler functions storage
     *
     * @type Array
     */
    this.handlers = [];

    /**
     * After functions storage
     *
     * @type Array
     */
    this.afters = [];
  };

  EventListener.prototype = {

    /**
     * Process event handlers
     *
     * Note: Store array of objects, check for `once` property and push to new array if not once
     * is about 1.5-2x faster then other methods: http://jsperf.com/store-events-object-vs-array/2
     *
     * @param {Object|Event} event
     */
    handle: function(event) {
      var handlers     = this.handlers,
          options      = this.options,
          compHandlers = [];

      for (var i = 0, len = handlers.length; i < len; i++) {
        var handler = handlers[i],
            returnValue;

        try {
          returnValue = handler.fn.call(handler.context, event);
        } catch(e) {
          // TODO - Log error
        }

        if (!handler.once) compHandlers.push(handler);

        if (returnValue === false) {
          event.preventDefault();
          event.stopPropagation();
        }

        if (event.stopped) break;
      }

      this.handlers = options.once ? [] : compHandlers;

      if (!event.defaultPrevented && options.defaultFn) options.defaultFn(event);

      if (!event.stopped) {
        var afters       = this.afters,
            aftersLength = afters.length;

        if (options.broadcast) baseEvent.fire(event.type, event);

        if (aftersLength > 0) {
          var j = 0;
          while(j < aftersLength) {
            var afterHandler = afters[j++];

            try {
              afterHandler.fn.call(afterHandler.context, event);
            } catch(e) {
              
            }
          }
        }
      }

      return event;
    },

    /**
     * Remove event handler
     *
     * @param {Function} callback Event callback to remove
     */
    remove: function(callback) {
      var handlers = this.handlers;

      for (var i = 0, len = handlers.length; i < len; i++) {
        if (handlers[i].fn === callback) {
          handlers.splice(i, 1);
          break;
        }
      }
    }
  };

  /**
   * Event target
   * Adds event functionality to object or creates mediator
   *
   * @class
   * @param {Object}      [options]           Global options for event
   * @param {EventTarget} [options.broadcast] Global event target to publish
   * @param {String}      [options.prefix]    Prefix for event types
   */
  EventTarget = function(options) {
    this._events = {};
    this._eventOptions = (options || this._eventOptions || {}); // TODO - check eventOptions read/rewrite
    this._eventTargets = [];
    this._eventDelayed = {};
  };

  EventTarget.prototype = {

    /**
     * Configure event
     *
     *     var mediator = new EventTarget;
     *
     *     mediator.event("status:updated", {
     *       defaultFn: function() {
     *         console.log("Status updated");
     *       }
     *     });
     *
     * @param {String}   type                Event name
     * @param {Object}   [options]           Options for event
     * @param {Function} [options.defaultFn] Default function for event
     * @param {Boolean}  [options.delayed]   Delay firing and fire with `.fireDelayed()`
     * @param {Boolean}  [options.once]      Fire all handlers once
     */
    event: function(type, options) {
      if (!this._events) EventTarget.call(this); // TODO - do something with this

      var events = this._events;

      if (!events[type]) {
        events[type] = new EventListener(options);
      } else {
        merge(events[type].options, options);
      }

      return this;
    },

    /**
     * Add parent for bubbling
     *
     * @param {EventTarget} target Parent object to bubble
     */
    addTarget: function(target) {
      if (!this._events) EventTarget.call(this);

      this._eventTargets.push(target);

      return this;
    },

    /**
     * Add event listener
     *
     * @param {String}   type      Event name
     * @param {Function} callback  Callback function to add
     * @param {Object}   [context] Context for using as `this` in callback
     * @param {Boolean}  [once]    Callback should fire once?
     */
    on: function(type, callback, context, once) {
      if (!this._events) EventTarget.call(this);

      if (!context) context = this;

      var events  = this._events,
          handler = { fn: callback, context: context };

      if (once) handler.once = true;

      if (!events[type]) events[type] = new EventListener(this._eventOptions);

      events[type].handlers.push(handler);

      // Optimization - if target has no wildcarded events - don't try to fire it
      if (type.indexOf("*") > -1) this._eventOptions.hasWildcard = true;

      return this;
    },

    /**
     * Add event listener and remove after first call
     *
     * @param {String} type Event name
     * @param {Function} callback Listener function to add
     */
    once: function(type, callback, context) {
      if (!this._events) EventTarget.call(this);
      return this.on(type, callback, context, true);
    },

    /**
     * Add after callback
     */
    after: function(type, callback, context) {
      if (!this._events) EventTarget.call(this);

      if (!context) context = this;

      var events  = this._events,
          handler = { fn: callback, context: context };

      if (!events[type]) events[type] = new EventListener(this._eventOptions);

      events[type].afters.push(handler);

      // Optimization - if target has no wildcarded events - don't try to fire it
      if (type.indexOf("*") > -1) this._eventOptions.hasWildcard = true;

      return this;
    },

    /**
     * Dispatch event
     *
     * @param {String} type    Event name
     * @param {Object} [event] Data for callback
     */
    fire: function(type, event, /* internal */ now) {
      if (!this._events) EventTarget.call(this);

      var options = this._eventOptions,
          targets = this._eventTargets;

      if (this._events[type]) {
        var eventOpts = this._events[type].options;

        if (eventOpts.delayed && !now) {
          this._eventDelayed[type] = event;
          return this;
        }

        event = addFacade(event, type, this, eventOpts);
        this._events[type].handle(event);
      } else {
        event = addFacade(event, type, this);
        if (!!options.defaultFn) options.defaultFn(event);
        if (options.broadcast) baseEvent.fire(event.type, event);
      }

      // Handle wildcard events
      if (this._eventOptions.hasWildcard) {
        var parts = type.split(":"), // TODO - regular expression?
            pLen  = parts.length;

        if (pLen > 1) {
          var pre  = parts[0] + ":*",
              post = "*:" + parts[pLen - 1];

          if (this._events[pre])  this._events[pre].handle(event);
          if (this._events[post]) this._events[post].handle(event);
        }
      }

      if (!event.stopped) {
        // Fire parent events
        if (targets.length > 0 && !event.cancelBubble) {
          event.bubbles = true;
          for (var i = 0, len = targets.length; i < len; i++) {
            targets[i].fire(event.type, event);
          }
        }
      }

      return this;
    },

    /**
     * Dispatch delayed events
     *
     *     target.on("hello", function(ev) { console.log("Hello " + ev.who); });
     *     target.event("hello", { delayed: true });
     *     target.fire("hello", { who: "world" }); // Nothing happens
     *     target.fire("hello", { who: "universe" }); // Nothing happens
     *     target.fireDelayed(); // "Hello world" "Hello universe"
     */
    fireDelayed: function() {
      var delayed = this._eventDelayed;

      for (var type in delayed) {
        if (delayed.hasOwnProperty(type)) {
          this.fire(type, delayed[type], true);
        }
      }

      return this;
    },

    /**
     * Detach event
     *
     * If callback function passed - remove callback
     * Else - detach whole event
     *
     *     var logEvent = function(ev) { console.log("Event fired", ev); };
     *     target.on("update", logEvent);
     *     target.off("update", logEvent);
     *
     * @param {String}   type       Event name
     * @param {Function} [callback] Callback to detach
     */
    off: function(type, callback) {
      if (callback) {
        var listener = this._events[type];
        if (listener) listener.remove(callback);
      } else {
        delete this._events[type];
      }
      return this;
    }
  };

  EventTarget.provides = "event";

  baseEvent = new EventTarget();

  baseEvent.Target = EventTarget;

  return baseEvent;
});