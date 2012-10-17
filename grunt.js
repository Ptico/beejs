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
      indent:   2,
      globals: {
        define: true
      }
    },

    // Lists of files to be minified with UglifyJS, used by the "min" task.
    min: {
      util:      { src: ["src/base/attribute.js"], dest: "dist/minified/base/attribute.js" },
      attribute: { src: ["src/base/attribute.js"], dest: "dist/minified/base/attribute.js" },
      event:     { src: ["src/base/event.js"],     dest: "dist/minified/base/event.js" }
    },

    // Global configuration options for UglifyJS.
    uglify: {
      
    },

    // headless testing through PhantomJS
    mocha: {
      base: {
        src: ["test/base.html"]
      }
    },

    // Configuration options for the "server" task.
    server: {},

    // Lists of files to be unit tested with Nodeunit, used by the "test" task.
    test: {},

    // Configuration options for the "watch" task.
    watch: {}

  });

  grunt.registerTask('default', 'lint test');
};
