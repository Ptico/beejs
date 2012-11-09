define("browser/event", ["browser/dom"], function(dom) {
  "use strict";

  var win  = window,
      doc  = win.document,
      html = doc.documentElement,
      body = doc.body,
      ael  = ("addEventListener" in body);

  function fixFacade(event, element) {
    event = event || win.event;

    if (!event.target) event.target = event.srcElement || element; // IE 7/8

    if (event.target && event.target.nodeType === 3) event.target = event.target.parentNode; // Safari

    if (event.pageX === null && event.clientX !== null) {
      event.pageX = event.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html && html.clientLeft || body && body.clientLeft || 0);
      event.pageY = event.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html && html.clientTop || body && body.clientTop || 0);
    }

    event.metaKey = !!event.metaKey; // IE 7/8

    event.stop = function() {
      event.preventDefault(event);
      event.stopPropagation(event);
      event.stopped = true;
    };
    if (!event.preventDefault)  event.preventDefault  = function() { event.returnValue = false; };
    if (!event.stopPropagation) event.stopPropagation = function() { event.cancelBubble = true; };

    return event;
  }

  function dispatchEvent(event, element) {
    fixFacade(event, element);

    var handlers = element.events[event.type],
        i = 0, len = handlers.length;

    while (i < len) {
      var handler = handlers[i++],
          returnValue;

      try {
        returnValue = handler.fn.call(handler.context, event, element);
      } catch(e) {
        if (console && console.error) console.error(e.stack);
      }

      if (returnValue === false) {
        event.preventDefault();
        event.stopPropagation();
      }

      if (event.stopped) break;
    }
  }

  dom.implement({
    /**
     * Attach event to each element
     */
    on: function(type, callback, context) {
      var nodes = this, i = nodes.length;

      while (i--) {
        var el = nodes[i],
            handler = { fn: callback, context: context || el }

        if (!el.events) {
          el.events = {};
        }

        if (!el.events[type]) {
          var eventHandle = function(ev) {
            dispatchEvent(ev, el);
          };

          el.events[type] = [handler];

          if (ael) {
            el.addEventListener(type, eventHandle, false);
          } else {
            el.attachEvent("on" + type, eventHandle);
          }
        } else {
          el.events[type].push(handler)
        }
      }

      return this;
    },

    once: function() {},
    fire: function() {},
    off: function() {}
  });
});