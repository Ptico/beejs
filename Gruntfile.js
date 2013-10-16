module.exports = function( grunt ) {
  "use strict";

  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.initConfig({
    // Project metadata, used by some directives, helpers and tasks.
    meta: {},

    // Global configuration options for JSHint.
    jshint: {
      all: ["src/**/*.js"],
      base: ['src/base/*.js'],
      browser: ['src/browser/*.js'],

      options: {
        forin:    true,
        noarg:    true,
        noempty:  true,
        bitwise:  false,
        eqeqeq:   false,
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
          process: true,
          unescape: true,
          setTimeout: true,
          setInterval: true,
          setImmediate: true,
          clearInterval: true
        }
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
      options: {
        report: 'gzip'
      },

      amd_base: {
        files: {
          'dist/amd/base/util.js':        ['src/base/util.js'],
          'dist/amd/base/attribute.js':   ['src/base/attribute.js'],
          'dist/amd/base/event.js':       ['src/base/event.js'],
          'dist/amd/base/enumerable.js':  ['src/base/enumerable.js'],
          'dist/amd/base/promise.js':     ['src/base/promise.js'],
          'dist/amd/base/querystring.js': ['src/base/querystring.js'],
          'dist/amd/base/uri.js':         ['src/base/uri.js']
        }
      },

      amd_browser: {
        files: {
          'dist/amd/browser/dom.js':   ['src/browser/dom.js'],
          'dist/amd/browser/event.js': ['src/browser/event.js'],
          'dist/amd/browser/net.js':   ['src/browser/net.js'],
          'dist/amd/browser/cookieStore.js': ['src/browser/cookieStore.js']
        }
      }
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
    connect: {
      server: {
        options: {
          port: 8000,
          base: '.',
          keepalive: true
        }
      }
    },

    // Configuration options for the "watch" task.
    watch: {
      base: {
        files: ['src/base/*.js', 'test/specs/base/**/*.js'],
        tasks: ['jshint:base', 'mocha:base']
      },
      browser: {
        files: ['src/browser/*.js', 'test/specs/browser/**/*.js'],
        tasks: ['jshint:browser', 'mocha:browser']
      }
    }

  });

  grunt.registerTask('test', 'mocha');
  grunt.registerTask('default', ['jshint', 'mocha']);
};
