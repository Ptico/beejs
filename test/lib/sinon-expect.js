/*
 * The code was ported from the excellent https://github.com/domenic/sinon-chai (c) Sam Hocevar
 */

(function(global) {
  var Assertion;

  if (global.expect) {
    Assertion = global.expect.Assertion;
  } else if (global.define && global.define.amd) {
    require("expect", function(expect) {
      Assertion = expect.Assertion;
    });
  } else {
    Assertion = require("expect.js").Assertion;
  }

  function getMessages(spy, action, nonNegatedSuffix, always, args) {
    nonNegatedSuffix = nonNegatedSuffix || "";

    return {
      ok:   spy.printf.apply(spy, ["expected %n to " + action + nonNegatedSuffix].concat(args)),
      fail: spy.printf.apply(spy, ["expected %n to not " + action].concat(args))
    };
  }

  function prop(name, action, nonNegatedSuffix) {
    Assertion.prototype[name] = function() {
      var msg = getMessages(this.obj, action, nonNegatedSuffix);

      this.assert(this.obj[name], msg.ok, msg.fail);

      return this;
    };
  }

  function meth(name, action, nonNegatedSuffix) {
    Assertion.prototype[name] = function() {
      var msg = getMessages(this.obj, action, nonNegatedSuffix, Array.prototype.slice.call(arguments));

      this.assert(this.obj[name].apply(this.obj, arguments), msg.ok, msg.fail);

      return this;
    };
  }

  prop("called", "have been called", " at least once, but it was never called");
  prop("calledOnce", "have been called exactly once", ", but it was called %c%C");
  prop("calledTwice", "have been called exactly twice", ", but it was called %c%C");
  meth("calledBefore", "have been called before %1");
  meth("calledAfter", "have been called after %1");
  meth("calledOn", "have been called with %1 as this", ", but it was called with %t instead");
  meth("calledWith", "have been called with arguments %*", "%C");
  meth("calledWithExactly", "have been called with exact arguments %*", "%C");
  meth("returned", "have returned %1");
})(this);