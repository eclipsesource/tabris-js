/*global tabris: true */
var Jasmine = require("jasmine");

global.Backbone = require("backbone");

require("./NativeBridgeSpy.js");
tabris = require("../../build/tabris/tabris.js");
require("./tabris-init.js");
require("./jasmineToString.js");

_ = tabris.util;

var runner = new Jasmine();
runner.loadConfig({
  "spec_dir": "test",
  "spec_files": [
    "tabris/**/*.spec.js"
  ]
});
runner.execute();
