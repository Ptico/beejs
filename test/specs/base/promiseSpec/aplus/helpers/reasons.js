define(['base/promise'], function(Promise) {
  'use strict';

  // This module reasons some valid rejection reason factories, keyed by human-readable versions of their names.
  var dummy = { dummy: 'dummy' },
      reasons = {};

  reasons['`undefined`'] = function() {
    return undefined;
  };

  reasons['`null`'] = function() {
    return null;
  };

  reasons['`false`'] = function() {
    return false;
  };

  reasons['`0`'] = function() {
    return 0;
  };

  reasons['an error'] = function() {
    return new Error();
  };

  reasons['an error without a stack'] = function() {
    var error = new Error();
    delete error.stack;

    return error;
  };

  reasons['a date'] = function() {
    return new Date();
  };

  reasons['an object'] = function() {
    return {};
  };

  reasons['an always-pending thenable'] = function() {
    return { then: function() { } };
  };

  reasons['a fulfilled promise'] = function() {
    return Promise.resolved(dummy);
  };

  reasons['a rejected promise'] = function() {
    return Promise.rejected(dummy);
  };

});
