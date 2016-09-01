/*global tabris: true */
var Jasmine = require("jasmine");
var path = require("path");

global.Backbone = require("backbone");

NativeBridgeSpy = require("./NativeBridgeSpy.js");
tabris = require("../../build/tabris/tabris.js");
require("./tabris-init.js");
require("./jasmineToString.js");

_ = tabris.util;

var spec = process.argv[2] ? path.relative("./test", process.argv[2]).replace(/\\/g,"/") : "tabris/**/*.spec.js";

var runner = new Jasmine();
runner.loadConfig({
  "spec_dir": "test",
  "spec_files": [spec]
});
runner.execute();
