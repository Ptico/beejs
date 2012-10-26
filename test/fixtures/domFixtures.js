define(function() {
  var fixture  = {},
      fixtures = {};

  /* HTML fixtures */
  fixtures.wrapper = '<div id="first" class="one">One</div>Hello\
    <div class="two"></div>&nbsp;<div class="three">Three</div><br>\
    <div id="last" class="five"></div>';

  fixtures.selector = '<div class="one"></div><span class="one"></span>\
    <button class="two" disabled>Press</button>';

  /* Helpers */
  fixture.fill = function(name) {
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