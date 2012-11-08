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

  fixtures.attributes = '<label for="text-input" id="test-label" class="custom-label" style="color: red;">User name</label>\
    <input type="text" name="username" id="text-input" placeholder="User" value="ptico">\
    <input type="checkbox" name="isAdmin" id="checkbox-checked" tabindex="2" checked>\
    <input type="checkbox" name="isManager" id="checkbox-not-checked" readonly>\
    <select name="role" id="select-input">\
      <option value="member">Member</option>\
      <option value="platinum" selected="selected">Platinum member</option>\
    </select>\
    <select name="" id="select-multiple" multiple>\
      <option value="1" selected>One</option>\
      <option value="2">Two</option>\
      <option value="3" selected>Three</option>\
    </select>\
    <button id="button-input">Press me</button>\
    <div id="inner-html"><i>Inner</i></div>';

  fixtures.traversing = '\
    <div id="grandparent">\
      <div class="parent parent-one">\
        <div class="children children-one"></div>\
        <div class="children children-two"></div>\
      </div>\
      <div class="parent parent-two">\
        <div class="children children-three"></div>\
        <span class="children children-four"></span>\
        <div class="children children-five"></div>\
        <div class="children children-six"></div>\
      </div>\
    </div>\
  ';

  fixtures.manipulations = '\
    <div id="zero">\
      <div id="one">\
        <div id="three" class="inner"></div>\
        <div id="four" class="inner"></div>\
      </div>\
    </div>\
    <div id="two" class="outer"></div>\
    <div id="five" class="outer"></div>\
  ';

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