/*global window: true, global: false, tabris: true */
var Jasmine = require("jasmine");

window = global;
window.Backbone = require("backbone");

require("../../src/tabris/util.js");
require("../../src/tabris/util-fonts.js");
require("../../src/tabris/util-images.js");
require("../../src/tabris/util-colors.js");

require("./NativeBridgeSpy.js");
tabris = require("../../build/tabris/tabris.js");
require("./tabris-init.js");
require("./jasmineToString.js");

var runner = new Jasmine();
runner.loadConfig({
  "spec_dir": "test",
  "spec_files": [
    "tabris/**/*.spec.js"
  ]
});
runner.execute();
