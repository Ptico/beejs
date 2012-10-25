define(function() {
  var fixture  = {},
      fixtures = {};

  /* HTML fixtures */
  fixtures.wrapper = '<div id="first" class="one">One</div>\
    <div class="two"></div>&nbsp;<div class="three">Three</div><br>\
    <div id="last" class="five"></div>';

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