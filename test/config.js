// Partial config file
requirejs.config({
  // Base URL relative to the test runner
  // Paths are relative to this
  baseUrl: '../src/',
  paths: {
    'fixtures': '../test/fixtures'
  },
  use: {
    mocha: {
      attach: 'mocha'
    }
  },
  // urlArgs: /debug\=1/.test(window.location.search) ? '' : 'bust=' +  (new Date()).getTime(), // debug
});

mocha.setup({
  ui: 'bdd',
  ignoreLeaks: false
});

// Protect from barfs
console = window.console || function() {};

// Don't track
window.notrack = true;