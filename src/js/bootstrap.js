tabris._start = function(client) {
  try {
    tabris._client = client;
    var rootModule = new tabris.Module();
    try {
      rootModule.require("tabris");
    } catch (error) {
      console.error("Could not load tabris module: " + error);
      console.log(error.stack);
      return;
    }
    if (tabris._init) {
      tabris._init(client);
    }
    var loadMain = function() {
      try {
        rootModule.require("./");
      } catch (error) {
        console.error("Could not load main module: " + error);
        console.log(error.stack);
      }
    };
    if (tabris._entryPoint) {
      tabris._entryPoint(loadMain);
      delete tabris._entryPoint;
    } else {
      loadMain();
    }
    tabris.trigger("flush");
  } catch (ex) {
    console.error(ex);
    console.log(ex.stack);
  }
};

tabris._notify = function() {
  // client may get the reference to _notify before tabris has been loaded
  tabris._notify.apply(this, arguments);
};
