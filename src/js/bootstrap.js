tabris._start = function(client) {
  tabris._client = client;
  var rootModule = new tabris.Module();
  try {
    rootModule.require("tabris");
  } catch (error) {
    console.error("Could not load tabris module: " + error);
    console.log(error.stack);
  }
  if (tabris._init) {
    tabris._init(client);
  }
  function loadMain() {
    try {
      rootModule.require("./");
    } catch (error) {
      console.error("Could not load main module: " + error);
      console.log(error.stack);
    }
  }
  if (tabris._entryPoint) {
    tabris._entryPoint(loadMain);
    delete tabris._entryPoint;
  } else {
    loadMain();
  }
  tabris.trigger("flush");
};

tabris._notify = function() {
  // client may get the reference to _notify before tabris has been loaded
  tabris._notify.apply(this, arguments);
};
