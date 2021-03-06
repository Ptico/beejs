// Partial config file
requirejs.config({
  // Base URL relative to the test runner
  // Paths are relative to this
  baseUrl: '../src/',
  paths: {
    'fixtures': '../test/fixtures',
    'vendor':   '../vendor',
    'spec':     '../test/specs',
    'vendor/selector': '../vendor/selector.' + cssSelector
  },
  use: {
    mocha: {
      attach: 'mocha'
    }
  },
  //urlArgs: /debug\=1/.test(window.location.search) ? '' : 'bust=' +  (new Date()).getTime(), // debug
  //urlArgs: 'v=1'
});

mocha.setup({
  ui: 'bdd',
  ignoreLeaks: false,
  timeout: 500
});

// Protect from barfs
console = window.console || function() {};

// Don't track
window.notrack = true;