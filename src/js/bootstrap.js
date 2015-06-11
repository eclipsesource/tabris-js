(function() {
  tabris._start = function(client) {
    try {
      window.global = window.self = window;
      tabris._client = client;
      var Module = tabris.Module;
      var rootModule = new Module();
      try {
        rootModule.require("tabris");
        tabris._client = client; // required by head.append and version check
        checkVersion();
      } catch (error) {
        console.error("Could not load tabris module: " + error);
        console.log(error.stack);
        return;
      }
      tabris._defineModule = function(id, fn) {
        return new Module(id, rootModule, fn);
      };
      var cordovaScript = document.createElement("script");
      cordovaScript.src = "./cordova.js";
      document.head.appendChild(cordovaScript);
      if (tabris._init) {
        tabris._init(client);
      }
      var loadMain = function() {
        try {
          rootModule.require("./");
          tabris.trigger("flush");
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

  function checkVersion() {
    var clientVersion = tabris._client.get("tabris.App", "tabrisJsVersion").split(".");
    var tabrisVersion = tabris.version.split(".");
    if (tabrisVersion[0] !== clientVersion[0]) {
      console.error(createVersionMessage(clientVersion, tabrisVersion, "incompatible with"));
    } else if (tabrisVersion[1] > clientVersion[1]) {
      console.warn(createVersionMessage(clientVersion, tabrisVersion, "newer than"));
    }
  }

  function createVersionMessage(clientVersion, tabrisVersion, versionComp) {
    var from = clientVersion[0] + ".0";
    var to = clientVersion[0] + "." + clientVersion[1];
    return "Version mismatch: JavaScript module \"tabris\" (version " + tabrisVersion.join(".") +
           ") " + "is " + versionComp + " the native tabris platform. " +
           "Supported module versions: " + from + " to " + to + ".";
  }

}());
