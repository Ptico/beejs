desc("Run all tests");
task("test", function() {
  jake.Task["test:all"].execute();
});

namespace("test", function() {
  desc("Run all tests");
  task("all", function() {
    var Mocha     = require("mocha"),
        requirejs = require('requirejs'),
        mocha     = new Mocha(),
        list      = new jake.FileList();

    // Configuration
    requirejs.config({
      nodeRequire: require,
      baseUrl: "src"
    });

    global.define = require('requirejs');
    global.expect = require('expect.js');
    global.sinon  = require("sinon");

    list.include("test/base/*");

    require("./test/sinon-expect");

    mocha.reporter('spec').ui('bdd');

    list.toArray().forEach(function(file) {
      mocha.addFile(file);
    });

    mocha.run(function(failures) {
      if (failures > 0) fail("Failed");
      complete();
    });
  }, { async: true });
});

desc("Lint sources using jshint");
task("lint", function() {
  var hint = require('jshint/lib/hint'),
      opts;

  opts = {
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
    predef:   {
      "define": false
    }
  };

  if (process.env.white) opts["white"] = true;

  hint.hint(["./src/base"], opts);
});

desc("Build distribution");
task("build", function() {
  // var jsp  = require("uglify-js").parser,
  //     pro  = require("uglify-js").uglify,
  //     path = require("path"),
  //     fs   = require("fs"),
  //     list = new jake.FileList();
  // 
  // list.include("src/base/*");
  // 
  // list.toArray().forEach(function(file) {
  //   var name       = path.basename(file),
  //       targetDir  = path.dirname(file).replace("src", "build"),
  //       targetPath = path.join(targetDir, name),
  //       code, ast, result;
  // 
  //   if (!path.existsSync(targetDir)) jake.mkdirP(targetDir);
  // 
  //   code   = fs.readFileSync(file, "utf8");
  //   ast    = jsp.parse(code);
  //   ast    = pro.ast_mangle(ast);
  //   ast    = pro.ast_squeeze(ast);
  //   result = pro.gen_code(ast);
  // 
  //   fs.writeFileSync(targetPath, result);
  //   jake.exec(["gzip -c " + targetPath + " > " + targetPath + ".gz"]);
  // });

  var requirejs = require('requirejs');
  var fs        = require("fs");

  var config = {
    appDir: "build",
    baseUrl: 'src/',
    optimize: "none",
    //optimize: "uglify",
    useStrict: true,
    modules: [
      { name: "base/util" },
      { name: "base/event" },
      { name: "base/attribute" }
    ]
  };

  requirejs.optimize(config, function(buildResponse) {
      //buildResponse is just a text output of the modules
      //included. Load the built file for the contents.
      //Use config.out to get the optimized file contents.
      var contents = fs.readFileSync(config.out, 'utf8');
  });
});