if (typeof window === "undefined") {
  global.window = global;
}
delete window.Promise;
require("./polyfill.min.js");
