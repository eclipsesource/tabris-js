const FILE_POSTFIXES = ['', '.js', '.json', '/package.json', '/index.js', '/index.json'];
const FOLDER_POSTFIXES = ['/package.json', '/index.js', '/index.json'];

export default class Module {

  constructor(id, parent, content) {
    this.id = id || null;
    this.parent = parent || null;
    let exports = {};
    let resolved = false;
    let require = this.require.bind(this);
    this._cache = this.parent ? this.parent._cache : {};
    if (id) {
      this._cache[id] = this;
    }
    Object.defineProperty(this, 'exports', {
      set(value) {
        exports = value;
      },
      get() {
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
  }

  require(request) {
    if (request.slice(0, 1) !== '.') {
      if (this._cache[request]) {
        return this._cache[request].exports;
      }
      return findNodeModule.call(this, request).exports;
    }
    return findFileModule.call(this, request).exports;
  }

  static createLoader(url) {
    let result;
    try {
      result = tabris._client.loadAndExecute(url, modulePrefix, modulePostfix);
    } catch (ex) {
      throw new Error('Could not parse ' + url + ':' + ex);
    }
    if (result.loadError) {
      return null;
    }
    return result.executeResult;
  }

  static readJSON(url) {
    let src = tabris._client.load(url);
    if (src) {
      try {
        return JSON.parse(src);
      } catch (ex) {
        throw new Error('Could not parse ' + url);
      }
    }
  }

}

function findFileModule(request) {
  let path = normalizePath(dirname(this.id) + '/' + request);
  let result = findModule.call(this, path, getPostfixes(request));
  if (!result) {
    throw new Error("Cannot find module '" + request + "'");
  }
  return result;
}

function findNodeModule(request) {
  let currentDir = dirname(this.id);
  let postfixes = getPostfixes(request);
  let modulesPath = '/node_modules';
  let filePath = modulesPath + '/' + request;
  let result;
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
    for (let i = 0; i < postfixes.length; i++) {
      let module = getModule.call(this, path + postfixes[i]);
      if (postfixes[i] === '/package.json') {
        if (getMain(module)) {
          let normalizedPath = normalizePath(path + '/' + getMain(module));
          module = findModule.call(this, normalizedPath, FILE_POSTFIXES);
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
    let data = Module.readJSON(url);
    if (data) {
      return new Module(url, this, data);
    }
  } else {
    let loader = Module.createLoader(url);
    if (loader) {
      return new Module(url, this, loader);
    }
  }
  this._cache[url] = false;
}

function getPostfixes(request) {
  return request.slice(-1) === '/' ? FOLDER_POSTFIXES : FILE_POSTFIXES;
}

let modulePrefix = '(function (module, exports, require, __filename, __dirname) { ';
let modulePostfix = '\n});';

function dirname(id) {
  if (!id || id.slice(0, 1) !== '.') {
    return './';
  }
  return id.slice(0, id.lastIndexOf('/'));
}

function normalizePath(path) {
  let segments = [];
  let pathSegments = path.split('/');
  for (let i = 0; i < pathSegments.length; i++) {
    let segment = pathSegments[i];
    if (segment === '..') {
      let removed = segments.pop();
      if (!removed || removed === '.') {
        return null;
      }
    } else if (segment === '.' ? segments.length === 0 : segment !== '') {
      segments.push(segment);
    }
  }
  return segments.join('/');
}
