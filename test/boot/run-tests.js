/*global window: true, global: false, document: true */
var Jasmine = require("jasmine");

window = global;
document = {
  createElement: function() {
    return {};
  },
  head: {
    appendChild: function() {}
  }
};

NativeBridgeSpy = require("../tabris/NativeBridgeSpy.js");
require("../../build/boot.js");

var runner = new Jasmine();
runner.loadConfig({
  "spec_dir": "test",
  "spec_files": [
    "boot/**/*.spec.js"
  ]
});
runner.execute();
