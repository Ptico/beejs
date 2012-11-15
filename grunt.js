module.exports = function( grunt ) {
  "use strict";

  grunt.loadNpmTasks('grunt-mocha');

  grunt.initConfig({
    // Project metadata, used by some directives, helpers and tasks.
    meta: {},

    // Lists of files to be linted with JSHint, used by the "lint" task.
    lint: {
      files: ["src/**/*.js"]
    },

    // Global configuration options for JSHint.
    jshint: {
      forin:    true,
      noarg:    true,
      noempty:  true,
      bitwise:  true,
      eqeqeq:   true,
      strict:   true,
      undef:    true,
      browser:  true,
      trailing: true,
      regexp:   true,
      expr:     true,
      indent:   2,
      globals: {
        define: true,
        window: true,
        escape: true,
        unescape: true,
        setTimeout: true,
        setInterval: true,
        clearInterval: true
      }
    },

    // Lists of files to be minified with UglifyJS, used by the "min" task.
    min: {
      // Base
      util:       { src: ["src/base/util.js"],      dest: "dist/minified/base/util.js" },
      attribute:  { src: ["src/base/attribute.js"], dest: "dist/minified/base/attribute.js" },
      event:      { src: ["src/base/event.js"],     dest: "dist/minified/base/event.js" },
      enumerable: { src: ["src/base/enumerable.js"],dest: "dist/minified/base/enumerable.js" },
      promise:    { src: ["src/base/promise.js"],   dest: "dist/minified/base/promise.js" },

      // Browser
      dom: { src: ["src/browser/dom.js"], dest: "dist/minified/browser/dom.js" },
      cookie: { src: ["src/browser/cookieStore.js"], dest: "dist/minified/browser/cookieStore.js" }
    },

    // Global configuration options for UglifyJS.
    uglify: {
      
    },

    // headless testing through PhantomJS
    mocha: {
      base: {
        src: ["test/base.html"]
      },
      browser: {
        src: ["test/browser.html"]
      }
    },

    // Configuration options for the "server" task.
    server: {
      port: 8000,
      base: '.'
    },

    // Lists of files to be unit tested with Nodeunit, used by the "test" task.
    test: {},

    // Configuration options for the "watch" task.
    watch: {}

  });

  grunt.registerTask('test', 'mocha');
  grunt.registerTask('default', 'lint mocha');
};
