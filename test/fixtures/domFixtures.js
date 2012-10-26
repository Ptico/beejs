define(function() {
  var fixture  = {},
      fixtures = {};

  /* HTML fixtures */
  fixtures.wrapper = '<div id="first" class="one">One</div>Hello\
    <div class="two"></div>&nbsp;<div class="three">Three</div><br>\
    <div id="last" class="five"></div>';

  fixtures.selector = '<div class="one"></div><span class="one"></span>\
    <button class="two" disabled>Press</button>';

  fixtures.finder = '<div class="parent parent-one">\
    <div class="child"></div>\
    <div class="child"></div>\
  </div><div class="parent parent-two">\
    <div class="child"></div>\
    <div class="child"></div>\
  </div>';

  fixtures.classes = '<div id="has-class" class="foo bar two-parts two_parts"></div>\
    <div class="foo baz"></div>';

  /* Helpers */
  fixture.load = function(name) {
    var fixt = fixtures[name];

    document.getElementById("fixtures").innerHTML = fixt;
  };

  fixture.clear = function() {
    document.getElementById("fixtures").innerHTML = "";
  };

  fixture.get = function() {
    return document.getElementById("fixtures");
  }

  fixture.fixtures = fixtures;

  return fixture;
});