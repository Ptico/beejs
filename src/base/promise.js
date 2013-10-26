(function(global) {
  'use strict';

  return define('base/promise', [], function() {
    var uid = 1,
        enqueue, PENDING, FULFILLED, REJECTED;

    // Dummy version of setImmediate polyfill
    if ('setImmediate' in global && typeof(global.setImmediate == 'function')) {
      enqueue = global.setImmediate;
    } else if (typeof(process) == 'object' && process.nextTick) {
      enqueue = process.nextTick;
    } else {
      enqueue = function(fn) { setTimeout(fn, 0); }; // TODO: consider use postmessage or message channel or image onload instead
    }


    function Deferred(promise) {
      this.promise = promise || new Promise();

      this._handlers = {
        fulfilled: [],
        rejected:  [],
        progress:  [],
        anyway:    []
      };
    }

    Deferred.prototype = {
      fulfill: function(value) {
        if (this.promise.state === PENDING) {
          this.promise.value = value;
          dispatch(this, FULFILLED, this.promise.value);
          this._handlers[REJECTED] = null;
        }

        return this;
      },

      reject: function(reason) {
        if (this.promise.state === PENDING) {
          this.promise.reason = reason;
          dispatch(this, REJECTED, this.promise.reason);
          this._handlers[FULFILLED] = null;
        }

        return this;
      },

      success: function(callback) {
        if (callback && this.promise.state === PENDING) {
          this._handlers[FULFILLED].push(callback);
        }

        if (this.promise.state === FULFILLED) {
          var value = this.promise.value;

          enqueue(function() {
            callback(value);
          });
        }

        return this;
      },

      fail: function(callback) {
        if (callback && this.promise.state === PENDING) {
          this._handlers[REJECTED].push(callback);
        }

        if (this.promise.state === REJECTED) {
          var reason = this.promise.reason;

          enqueue(function() {
            callback(reason);
          });
        }

        return this;
      },

      resolve: function(x) {
        var self = this;

        if (!!x && (typeof(x) == 'function' || typeof(x) == 'object')) { // 2.3.3
          x = assimilate(this, x);
        }

        if (x instanceof Promise) { // 2.3.2 - value is trusted promise
          if (x.isPending()) { // 2.3.2.1 - wait until x is fulfilled or rejected
            x.deferred.success(function(v) { self.fulfill(v); });
            x.deferred.fail(function(r) { self.reject(r);  });
          }
          if (x.isFulfilled()) this.fulfill(x.value); // 2.3.2.2
          if (x.isRejected())  this.reject(x.reason); // 2.3.2.3
        } else this.fulfill(x); // 2.3.4
      }
    };

    function dispatch(deferred, state, val) {
      var handlers = deferred._handlers[state],
          handler;

      deferred.promise.state = state;

      enqueue(function() {
        /*jshint boss:true */
        while(handler = handlers.shift()) {
          handler(val); // 2.2.5
        }
      });
    }

    function assimilate(dfd, x) {
      if (x === dfd.promise) { // 2.3.1 - promise and value are the same object
        dfd.reject(new TypeError('Promise can not resolve itself'));
      }

      var then;

      try {
        then = x.then; // 2.3.3.1
      } catch (e) {
        dfd.reject(e); // 2.3.3.2
      }

      // 2.3.3.3
      if (typeof(then) == 'function') {
        return new Promise(function(resolve, reject) {
          var callbackCalled = false;

          try {
            then.call(x, function(y) {
              if (!callbackCalled) { // 2.3.3.3.3
                callbackCalled = true;
                resolve(y);
              }
            }, function(r) {
              if (!callbackCalled) {
                callbackCalled = true;
                reject(r);
              }
            });
          } catch (e) { // 2.3.3.3.4
            if (!callbackCalled) { dfd.reject(e); } // 2.3.3.3.4.2
          }
        });
      } else {
        return x; // 2.3.3.4
      }
    }

    /**
     * Create a new promise
     *
     * @class
     * @params {Function} resolver <Function resolve, Function reject>
     */
    function Promise(resolver) {
      var deferred = new Deferred(this);

      this.uid = uid++;

      this.state = PENDING;
      this.deferred = deferred;

      this.value = void 0;
      this.reason = void 0;

      if (typeof(resolver) == 'function') {
        resolver.call(this,
          function(value) { deferred.resolve(value); },
          function(value) { deferred.reject(value);  }
        );
      }
    }

    // Allowed promise states
    Promise.PENDING   = PENDING   = 'pending';
    Promise.FULFILLED = FULFILLED = 'fulfilled';
    Promise.REJECTED  = REJECTED  = 'rejected';

    Promise.prototype = {
      then: function(onFulfilled, onRejected) {
        var promise = Promise.pending();

        if (typeof(onFulfilled) == 'function') {
          this.deferred.success(thenCallback(promise.deferred, onFulfilled));
        } else {
          this.deferred.success(function(v) {
            promise.deferred.fulfill(v);
          });
        }

        if (typeof(onRejected) == 'function') {
          this.deferred.fail(thenCallback(promise.deferred, onRejected));
        } else {
          this.deferred.fail(function(v) {
            promise.deferred.reject(v);
          });
        }

        return promise;
      },

      'yield': function() {},
      tap: function() {},
      spread: function() {},

      // Array methods
      all: function() {},
      map: function() {},
      reduce: function() {},
      settle: function() {},
      filter: function() {},
      eachSlice: function() {},

      any: function() {},
      some: function() {},

      isPending: function() {
        return this.state === PENDING;
      },

      isFulfilled: function() {
        return this.state === FULFILLED;
      },

      isRejected: function() {
        return this.state === REJECTED;
      }
    };

    Promise.pending = function() {
      return new Promise();
    };

    Promise.when = function() {};

    Promise.fulfilled = Promise.resolved = function(value) {
      var deferred = (new Promise()).deferred;

      deferred.fulfill(value);

      return deferred.promise;
    };

    Promise.rejected = function(reason) {
      var deferred = (new Promise()).deferred;

      deferred.reject(reason);

      return deferred.promise;
    };

    Promise.deferred = function() {
      return (new Promise()).deferred;
    };

    function thenCallback(dfd, callback) {
      return function(v) {
        var ret;

        try {
          ret = callback(v);
        } catch (e) {
          return dfd.reject(e);
        }

        dfd.resolve(ret);
      };
    }

    return Promise;
  });

})(this);
