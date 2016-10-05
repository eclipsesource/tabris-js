(function() {

  // create preliminary tabris object
  if (typeof global === 'object') {
    global.tabris = {};
  } else {
    // TODO: clients still expose the global object as "window"
    window.tabris = {};
  }

  var Module = tabris.Module = function(id, parent, content) {
    this.id = id || null;
    this.parent = parent || null;
    var exports = {};
    var resolved = false;
    var require = this.require.bind(this);
    this._cache = this.parent ? this.parent._cache : {};
    if (id) {
      this._cache[id] = this;
    }
    Object.defineProperty(this, 'exports', {
      set: function(value) {
        exports = value;
      },
      get: function() {
        if (!resolved) {
          resolved = true;
          if (typeof content === 'function') {
            content(this, exports, require, id.slice(1), dirname(id).slice(1));
          } else if (content instanceof Object) {
            exports = content;
          }
        }
        return exports;
      }
    });
  };

  Module.prototype = {

    require: function(request) {
      if (request.slice(0, 1) !== '.') {
        if (this._cache[request]) {
          return this._cache[request].exports;
        }
        return findNodeModule.call(this, request).exports;
      }
      return findFileModule.call(this, request).exports;
    }

  };

  Module.createLoader = function(url) {
    var result;
    try {
      result = tabris._client.loadAndExecute(url, modulePrefix, modulePostfix);
    } catch (ex) {
      throw new Error('Could not parse ' + url + ':' + ex);
    }
    if (result.loadError) {
      return null;
    }
    return result.executeResult;
  };

  Module.readJSON = function(url) {
    var src = tabris._client.load(url);
    if (src) {
      try {
        return JSON.parse(src);
      } catch (ex) {
        throw new Error('Could not parse ' + url);
      }
    }
  };

  function findFileModule(request) {
    var path = normalizePath(dirname(this.id) + '/' + request);
    var result = findModule.call(this, path, getPostfixes(request));
    if (!result) {
      throw new Error("Cannot find module '" + request + "'");
    }
    return result;
  }

  function findNodeModule(request) {
    var currentDir = dirname(this.id);
    var postfixes = getPostfixes(request);
    var modulesPath = '/node_modules';
    var filePath = modulesPath + '/' + request;
    var result;
    do {
      result = findModule.call(this, normalizePath(currentDir + filePath), postfixes);
      currentDir = normalizePath(currentDir + '/..');
      if (currentDir && currentDir.slice(-1 * modulesPath.length) === modulesPath) {
        currentDir = normalizePath(currentDir + '/..');
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
        var module = getModule.call(this, path + postfixes[i]);
        if (postfixes[i] === '/package.json') {
          if (getMain(module)) {
            var normalizedPath = normalizePath(path + '/' + getMain(module));
            module = findModule.call(this, normalizedPath, filePostfixes);
          } else {
            module = null;
          }
        }
        if (module) {
          return module;
        }
      }
    }
  }

  function getMain(module) {
    return module && module.exports && module.exports.main;
  }

  function getModule(url) {
    if (url in this._cache) {
      return this._cache[url];
    }
    if (url.slice(-5) === '.json') {
      var data = Module.readJSON(url);
      if (data) {
        return new Module(url, this, data);
      }
    } else {
      var loader = Module.createLoader(url);
      if (loader) {
        return new Module(url, this, loader);
      }
    }
    this._cache[url] = false;
  }

  function getPostfixes(request) {
    return request.slice(-1) === '/' ? folderPostfixes : filePostfixes;
  }

  var modulePrefix = '(function (module, exports, require, __filename, __dirname) { ';
  var modulePostfix = '\n});';

  function dirname(id) {
    if (!id || id.slice(0, 1) !== '.') {
      return './';
    }
    return id.slice(0, id.lastIndexOf('/'));
  }

  function normalizePath(path) {
    var segments = [];
    var pathSegments = path.split('/');
    for (var i = 0; i < pathSegments.length; i++) {
      var segment = pathSegments[i];
      if (segment === '..') {
        var removed = segments.pop();
        if (!removed || removed === '.') {
          return null;
        }
      } else if (segment === '.' ? segments.length === 0 : segment !== '') {
        segments.push(segment);
      }
    }
    return segments.join('/');
  }

  var filePostfixes = ['', '.js', '.json', '/package.json', '/index.js', '/index.json'];
  var folderPostfixes = ['/package.json', '/index.js', '/index.json'];

}());
