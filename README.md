# Bee.js

[![Build Status](https://secure.travis-ci.org/Ptico/beejs.png)](http://travis-ci.org/Ptico/beejs)

## Base

### Event

```js
require("base/event", function(event) {
  var mediator = new event.Target();

  mediator.on("message:posted", function(ev) {
    if (ev.message.length == 0) ev.stop();

    console.log("New message posted: " + ev.message);
  });

  mediator.fire("message:posted", { message: "Hello world!" });
});
```

### Attribute

```js
require("base/util", "base/attribute", function(util, attr) {
  var container = {};

  util.mix(attr.Target, container);

  container.set("foo", "bar");

  container.attribute("distance", {
    default: "0",

    setter: function(val) {
      return val + "km";
    }
  });

  container.get("distance"); //=> "0km"

  container.keys(); //=> ["foo", "distance"]
});
```

## Development and testing requirements

    npm install
    brew install phantomjs

## License

MIT license: http://www.opensource.org/licenses/MIT