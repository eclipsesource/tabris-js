(function() {

  window.tabris = {}; // create preliminary tabris object

  var Module = tabris.Module = function(id, parent, content) {
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
      if (request.slice(0, 1) !== ".") {
        if (this._cache[request]) {
          return this._cache[request].exports;
        }
        return findNodeModule.call(this, request);
      }
      return findFileModule.call(this, request);
    }

  };

  Module.createLoader = function(url) {
    var src = tabris._client.load(url);
    if (src) {
      try {
        return tabris._client.runInThisContext(wrapSource(src), url);
      } catch (ex) {
        // src may be an index.html
        if (url.slice(-3) === ".js") {
          throw new Error("Could not parse " + url);
        }
      }
    }
  };

  Module.readJSON = function(url) {
    var src = tabris._client.load(url);
    if (src) {
      try {
        return JSON.parse(src);
      } catch (ex) {
        throw new Error("Could not parse " + url);
      }
    }
  };

  function findFileModule(request) {
    var path = normalizePath(dirname(this.id) + "/" + request);
    var result = findModule.call(this, path, getPostfixes(request));
    if (!result) {
      throw new Error("Cannot find module '" + request + "'");
    }
    return result;
  }

  function findNodeModule(request) {
    var currentDir = dirname(this.id);
    var postfixes = getPostfixes(request);
    var modulesPath = "/node_modules";
    var filePath = modulesPath + "/" + request;
    var result;
    do {
      result = findModule.call(this, normalizePath(currentDir + filePath), postfixes);
      currentDir = normalizePath(currentDir + "/..");
      if (currentDir && currentDir.slice(-1 * modulesPath.length) === modulesPath) {
        currentDir = normalizePath(currentDir + "/..");
      }
    } while (!result && currentDir);
    if (!result) {
      throw new Error("Cannot find module '" + request + "'");
    }
    return result;
  }

  function findModule(path, postfixes) {
    if (path) {
      for (var i = 0; i < postfixes.length; i++) {
        var module = getModule.call(this, path, postfixes[i]);
        if (module) {
          return module;
        }
      }
    }
  }

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

  function getPostfixes(request) {
    return request.slice(-1) === "/" ? folderPostfixes : filePostfixes;
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

  var filePostfixes = ["", ".js", ".json", "/package.json", "/index.js", "/index.json"];
  var folderPostfixes = ["/package.json", "/index.js", "/index.json"];

}());
