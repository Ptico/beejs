define(function(require) {
  /* Stringify */
  require('spec/base/querystringSpec/stringify/base');

  require('spec/base/querystringSpec/stringify/arrays');

  require('spec/base/querystringSpec/stringify/objects');

  require('spec/base/querystringSpec/stringify/options');

  /* Parse */
  require('spec/base/querystringSpec/parse/base');

  require('spec/base/querystringSpec/parse/coercion');

  require('spec/base/querystringSpec/parse/preparsing');

  require('spec/base/querystringSpec/parse/arrays');

  require('spec/base/querystringSpec/parse/objects');

  require('spec/base/querystringSpec/parse/options');
});