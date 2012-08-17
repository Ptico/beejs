define("bee", ["base/util", "base/event", "base/attribute"], function(util, event, attr) {
  util.event = event;
  util.attr  = attr;

  return util;
});
