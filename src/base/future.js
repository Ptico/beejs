define("base/future", [], function() {
  "use strict";

  /**
   * Promise provide simple interface for async operations
   *
   * @class
   */
  var Promise = function() {
    this._promises = {
      done: [],
      fail: [],
      progress: [],
      anyway: []
    };

    this._promiseState = "pending";

    this._promiseResult = void 0;
  };

  Promise.PENDING = 'pending';
  Promise.FAIL    = 'fail';
  Promise.DONE    = 'done';

  Promise.prototype = {
    /**
     * Add callbacks which will be called, when promise will resolved
     *
     * @param {Function} fn        Callback function to add
     * @param            [context] Context for using as `this` inside function
     */
    done: function(fn, context) {
      if (fn) {
        if (this._promiseState === "done") {
          fn.call(context || this, this._promiseResult);
        } else {
          this._promises.done.push({ fn: fn, context: context || this });
        }
      }

      return this;
    },

    /**
     * Add callbacks which will be called, when promise will rejected
     *
     * @param {Function} fn        Callback function to add
     * @param            [context] Context for using as `this` inside function
     */
    fail: function(fn, context) {
      if (fn) {
        if (this._promiseState === "fail") {
          fn.call(context || this, this._promiseResult);
        } else {
          this._promises.fail.push({ fn: fn, context: context || this });
        }
      }

      return this;
    },

    /**
     * Add callbacks which will be called in both cases: resolved or rejected
     *
     * @param {Function} fn        Callback function to add
     * @param            [context] Context for using as `this` inside function
     */
    anyway: function(fn, context) {
      if (fn) {
        if (this._promiseState !== "pending") {
          fn.call(context || this, this._promiseResult);
        } else {
          this._promises.anyway.push({ fn: fn, context: context || this });
        }
      }

      return this;
    },

    /**
     * Add callback which will be called each time, when object notified about progress
     * If no `fn` given, returns the last progress message
     *
     * @param {Function} fn        Callback function to add
     * @param            [context] Context for using as `this` inside function
     */
    progress: function(fn, context) {
      if (fn) {
        this._promises.progress.push({ fn: fn, context: context || this });
      } else return this._promiseProgress;

      return this;
    },

    /**
     * Add resolve, reject and progress callbacks
     *
     * @param {Function} [doneFn]     Resolve callback
     * @param {Function} [failFn]     Reject callback
     * @param {Function} [progressFn] Progress callback
     */
    then: function(doneFn, failFn, progressFn) {
      return this.done(doneFn).fail(failFn).progress(progressFn);
    },

    /**
     * Set promise state and ivoke callbacks
     *
     * @param {String} state    Promise state: done or fail
     * @param          [result] Result which will be passed to callback
     */
    complete: function(state, result) {
      if (state !== "done" && state !== "fail") return;

      var callbacks = this._promises[state],
          anyways   = this._promises.anyway,
          i = 0, j = 0,
          len    = callbacks.length,
          anyLen = anyways.length;

      this._promiseResult = result;
      this._promiseState  = state;

      while (i < len) {
        var callback = callbacks.shift();
        callback.fn.call(callback.context, result, this);
        i++;
      }

      while (j < anyLen) {
        var any = anyways.shift();
        any.fn.call(any.context, result, this);
        j++;
      }

      return this;
    },

    /**
     * Reject promise and call fail callbacks
     *
     * @param [result] Result which will be passed to callback
     */
    reject: function(result) {
      return this.complete("fail", result);
    },

    /**
     * Resolve promise and call done callbacks
     *
     * @param [result] Result which will be passed to callback
     */
    resolve: function(result) {
      return this.complete("done", result);
    },

    /**
     * Get promise state (pending, done, fail)
     */
    state: function() {
      return this._promiseState;
    },

    /**
     * Set progress and call progress callbacks
     */
    notify: function(msg) {
      if (this._promiseState !== "pending") return;

      this._promiseProgress = msg;

      var callbacks = this._promises.progress,
          i = 0, len = callbacks.length;

      while (i < len) {
        var callback = callbacks[i];
        callback.fn.call(callback.context, msg, this);
        i++;
      }

      return this;
    }
  };

  return Promise;
});