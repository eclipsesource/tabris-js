(function(exports) {

  var module;

  var Module = exports.Module = function(id, parent, content) {
    this.id = id || null;
    this.parent = parent || null;
    this.exports = {};
    this._cache = this.parent ? this.parent._cache : {};
    if (id) {
      this._cache[id] = this;
    }
    if (typeof content === "function") {
      content(this, this.exports, this.require.bind(this));
    } else if (content instanceof Object) {
      this.exports = content;
    }
  };

  Module.prototype = {

    require: function(request) {
      var currentDir = dirname(this.id);
      if (request.slice(0, 1) !== ".") {
        if (this._cache[request]) {
          return this._cache[request].exports;
        }
        currentDir = "./node_modules";
      }
      var postfixes = request.slice(-1) === "/" ? folderPostfixes : filePostfixes;
      var path = normalizePath(currentDir + "/" + request);
      if (path) {
        for (var i = 0; i < postfixes.length; i++) {
          var module = getModule.call(this, path, postfixes[i]);
          if (module) {
            return module;
          }
        }
      }
      throw new Error("Cannot find module '" + request + "'");
    }

  };

  var filePostfixes = ["", ".js", ".json", "/package.json", "/index.js", "/index.json"];
  var folderPostfixes = ["/package.json", "/index.js", "/index.json"];

  Module.loadMain = function() {
    try {
      Module.require("./");
    } catch (error) {
      console.error("Could not load main module: " + error);
      console.log(error.stack);
    }
  };

  Module.createLoader = function(url) {
    var bridge = tabris._nativeBridge._bridge;
    var src = bridge.load(url);
    if (src) {
      try {
        return bridge.runInThisContext(wrapSource(src), url);
      } catch (ex) {
        // src may be an index.html
        if (url.slice(-3) === ".js") {
          throw new Error("Could not parse " + url);
        }
      }
    }
  };

  Module.readJSON = function(url) {
    var bridge = tabris._nativeBridge._bridge;
    var src = bridge.load(url);
    if (src) {
      try {
        return JSON.parse(src);
      } catch (ex) {
        throw new Error("Could not parse " + url);
      }
    }
  };

  Module.define = function(id, content) {
    return new Module(id, module, content);
  };

  Module.require = function(id) {
    return module.require(id);
  };

  module = Module.define("module", function(module) {
    module.exports = Module;
  });

  function getModule(path, postfix) {
    var url = path + postfix;
    if (url in this._cache) {
      return this._cache[url] ? this._cache[url].exports : undefined;
    }
    if (url.slice(-5) === ".json") {
      var data = Module.readJSON(url);
      if (data) {
        if (postfix === "/package.json" && data.main) {
          url = path + "/" + data.main;
          var mainLoader = Module.createLoader(url);
          if (mainLoader) {
            return new Module(url, this, mainLoader).exports;
          }
        } else {
          return new Module(url, this, data).exports;
        }
      }
    } else {
      var loader = Module.createLoader(url);
      if (loader) {
        return new Module(url, this, loader).exports;
      }
    }
    this._cache[url] = false;
  }

  function wrapSource(source) {
    return "(function (module, exports, require) { " + source + "\n});";
  }

  function dirname(id) {
    if (!id || id.slice(0, 1) !== ".") {
      return "./";
    }
    return id.slice(0, id.lastIndexOf("/"));
  }

  function normalizePath(path) {
    var segments = [];
    var pathSegments = path.split("/");
    for (var i = 0; i < pathSegments.length; i++) {
      var segment = pathSegments[i];
      if (segment === "..") {
        var removed = segments.pop();
        if (!removed || removed === ".") {
          return null;
        }
      } else if (segment === "." ? segments.length === 0 : segment !== "") {
        segments.push(segment);
      }
    }
    return segments.join("/");
  }

}(window.tabris = {}));
