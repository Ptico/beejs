define(['base/promise'], function(Promise) {
  'use strict';

  var other = { other: 'other' },
      thenables = {};

  thenables.fulfilled = {
    'a synchronously-fulfilled custom thenable': function(value) {
      return {
        then: function(onFulfilled) {
          onFulfilled(value);
        }
      };
    },

    'an asynchronously-fulfilled custom thenable': function(value) {
      return {
        then: function(onFulfilled) {
          setTimeout(function() {
            onFulfilled(value);
          }, 0);
        }
      };
    },

    'a synchronously-fulfilled one-time thenable': function(value) {
      var numberOfTimesThenRetrieved = 0;

      return Object.create(null, {
        then: {
          get: function() {
            if (numberOfTimesThenRetrieved === 0) {
              ++numberOfTimesThenRetrieved;

              return function(onFulfilled) {
                onFulfilled(value);
              };
            }
            return null;
          }
        }
      });
    },

    'a thenable that tries to fulfill twice': function(value) {
      return {
        then: function(onFulfilled) {
          onFulfilled(value);
          onFulfilled(other);
        }
      };
    },

    'a thenable that fulfills but then throws': function(value) {
      return {
        then: function(onFulfilled) {
          onFulfilled(value);
          throw other;
        }
      };
    },

    'an already-fulfilled promise': function(value) {
      return Promise.resolved(value);
    },

    'an eventually-fulfilled promise': function(value) {
      var d = Promise.deferred();

      setTimeout(function() {
        d.resolve(value);
      }, 50);

      return d.promise;
    }
  };

  thenables.rejected = {
    'a synchronously-rejected custom thenable': function(reason) {
      return {
        then: function(onFulfilled, onRejected) {
          onRejected(reason);
        }
      };
    },

    'an asynchronously-rejected custom thenable': function(reason) {
      return {
        then: function(onFulfilled, onRejected) {
          setTimeout(function() {
            onRejected(reason);
          }, 0);
        }
      };
    },

    'a synchronously-rejected one-time thenable': function(reason) {
      var numberOfTimesThenRetrieved = 0;

      return Object.create(null, {
        then: {
          get: function() {
            if (numberOfTimesThenRetrieved === 0) {
              ++numberOfTimesThenRetrieved;

              return function(onFulfilled, onRejected) {
                onRejected(reason);
              };
            }

            return null;
          }
        }
      });
    },

    'a thenable that immediately throws in `then`': function(reason) {
      return {
        then: function() {
          throw reason;
        }
      };
    },

    'an object with a throwing `then` accessor': function(reason) {
      return Object.create(null, {
        then: {
          get: function() {
            throw reason;
          }
        }
      });
    },

    'an already-rejected promise': function(reason) {
      return Promise.rejected(reason);
    },

    'an eventually-rejected promise': function(reason) {
      var d = Promise.deferred();

      setTimeout(function() {
        d.reject(reason);
      }, 50);

      return d.promise;
    }
  };

  return thenables;
});
