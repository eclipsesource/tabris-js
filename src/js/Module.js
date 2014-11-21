/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  // Common.js allows a "conceptual module name space root". This one makes us node.js compatible.
  var MODULE_ROOT = "./node_modules/";

  tabris.Module = function(id, parent) {
    this.id = id;
    this.parent = parent;
    // TODO: remove instanceof check once root is the main module instead of window
    if (this.parent && (this.parent.children instanceof Array)) {
      this.parent.children.push(this);
    }
    this.filename = null;
    this.children = [];
    this.exports = {};
  };

  tabris.Module.prototype._load = function() {
    var bridge = tabris._nativeBridge._bridge;
    var fileNames = getFileNamesFor(this);
    var source;
    for (var i = 0; i < fileNames.length; i++) {
      source = bridge.load(fileNames[i]);
      if (source) {
        this.filename = fileNames[i];
        break;
      }
    }
    if (this.filename && (this.filename.slice(-12) === "package.json")) {
      var pkg = JSON.parse(source);
      if (pkg.main) {
        source = bridge.load(this.id + "/" + pkg.main);
      }
    }
    if (!source) {
      throw new Error("Cannot find module '" + this.id + "'");
    }
    var loader = bridge.runInThisContext(wrapSource(source));
    loader(this, this.exports, this.require.bind(this));
  };

  tabris.Module.prototype.require = function(path, requestingModule) {
    return this.parent.require(path, requestingModule || this);
  };

  tabris.Module.installRequire = function(target) {
    var moduleCache = {};
    target.require = function(path, requestingModule) {
      var parent = requestingModule || target;
      var id = getIdFromPath(path, parent);
      if (!moduleCache[id]) {
        moduleCache[id] = new tabris.Module(id, parent);
        moduleCache[id]._load();
      }
      return moduleCache[id].exports;
    };
  };

  function getIdFromPath(path, parent) {
    // NOTE: unlike node we can't (reasonably) look up alternate module locations (like home)
    if (path.slice(0, 1) === ".") {
      var parentId = parent instanceof tabris.Module ? parent.id : "./";
      var parentPath = parentId.slice(0, parentId.lastIndexOf("/"));
      var relativeId = path.slice(0, 2) === "./" ? path.slice(2) : path; // strip "./"
      return getAbsoluteId(relativeId, parentPath);
    }
    // TODO: check for native modules first (currently there are none)
    return MODULE_ROOT + path;
  }

  function getAbsoluteId(relativeId, currentDir) {
    if (relativeId.slice(0, 3) === "../") {
      if (currentDir === ".") {
        throw new Error("Cannot find module '" + relativeId + "'");
      }
      currentDir = currentDir.slice(0, currentDir.lastIndexOf("/"));
      return getAbsoluteId(relativeId.slice(3), currentDir);
    }
    return currentDir + "/" + relativeId;
  }

  function getFileNamesFor(module) {
    // TODO: try .json as well (like node)
    // Should we also try first without extension and /index.js? (again, like node)
    return [module.id + ".js", module.id + "/package.json"];
  }

  function wrapSource(source) { // TODO: do this natively
    return "(function (module, exports, require) { " + source + "\n});";
  }

  // TODO: will no longer be needed once a main module exists:
  tabris.Module.installRequire(window);

}());
