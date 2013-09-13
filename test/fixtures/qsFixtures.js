define(function() {
  'use strict';

  var fixtures = {};

  fixtures.base = {
    'a=b': { a: 'b' },
    'a=b&b=2': { a: 'b', b: 2 },
    'a=':  { a: '' },
    'a=b=c': { a: 'b=c' },
    'a=b=c&c': { a: 'b=c', c: undefined },
    'a=1&b=foo&c=false': { a: 1, b: 'foo', c: false }
  };

  return fixtures;
});