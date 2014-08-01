/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

/*global console: true */

tabris.Console = function() {
  var console = this;
  ["log", "info", "warn", "error"].forEach(function(name) {
    console[name] = function() {
      var args = Array.prototype.slice.call(arguments, 0);
      tabris._nativeBridge.call("tabris.Console", name, {args: args});
    };
  });
};

// TODO [rst] when window is the global object, should we use window.console instead?
if(typeof console === "undefined") {
  console = new tabris.Console();
}
