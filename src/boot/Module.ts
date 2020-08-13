/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable no-invalid-this */
const FILE_POSTFIXES = ['', '.js', '.json', '/package.json', '/index.js', '/index.json'];
const FOLDER_POSTFIXES = ['/package.json', '/index.js', '/index.json'];

type ModuleLoader = (
  module: Module,
  exports: any,
  require: Module['require'],
  filename: string,
  dirname: string
) => any;

export default class Module {

  public static root: Module;

  public readonly id: string;
  public readonly parent: Module | null;
  public exports: any = {};
  protected readonly _cache: {[id: string]: Module | false} = {};

  constructor(id?: string, parent?: Module | null, content?: ModuleLoader | object) {
    this.id = id || '';
    this.parent = parent || null;
    let exports = {};
    let resolved = false;
    const require = this.require.bind(this);
    Object.defineProperty(this, '_cache', {
      enumerable: false, writable: false, value: this.parent ? this.parent._cache : this._cache
    });
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
          if (typeof content === 'function' && id) {
            content(this, exports, require, id.slice(1), dirname(id).slice(1));
          } else if (content instanceof Object) {
            exports = content;
          }
        }
        return exports;
      }
    });
  }

  public require(request: string) {
    if (request.slice(0, 1) !== '.') {
      const cached = this._cache[request];
      if (cached) {
        return cached.exports;
      }
      return findNodeModule.call(this, request).exports;
    }
    return findFileModule.call(this, request).exports;
  }

  static createLoader(url: string): ModuleLoader | null {
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

  static execute(code: string, url: string) {
    return tabris._client.execute(code, url).executeResult;
  }

  static readJSON(url: string) {
    const src = this.load(url);
    if (src) {
      try {
        return JSON.parse(src);
      } catch (ex) {
        throw new Error('Could not parse ' + url);
      }
    }
  }

  static getSourceMap() {
    return null;
  }

  static load(url: string) {
    return tabris._client.load(url);
  }

  static createRequire(path: string) {
    if ((typeof path !== 'string') || path[0] !== '/') {
      throw new Error(`The argument 'path' must be an absolute path string. Received ${path}`);
    }
    return function(request: string) {
      return Module.root.require(normalizePath(dirname('.' + path) + '/' + request));
    };
  }

}

Module.root = new Module();

function findFileModule(this: Module, request: string) {
  const path = normalizePath(dirname(this.id) + '/' + request);
  const result = findModule.call(this, path, getPostfixes(request));
  if (!result) {
    throw new Error('Cannot find module \'' + request + '\'');
  }
  return result;
}

function findNodeModule(this: Module, request: string) {
  let currentDir = dirname(this.id);
  const postfixes = getPostfixes(request);
  const modulesPath = '/node_modules';
  const filePath = modulesPath + '/' + request;
  let result;
  do {
    result = findModule.call(this, normalizePath(currentDir + filePath), postfixes);
    currentDir = normalizePath(currentDir + '/..');
    if (currentDir && currentDir.slice(-1 * modulesPath.length) === modulesPath) {
      currentDir = normalizePath(currentDir + '/..');
    }
  } while (!result && currentDir);
  if (!result) {
    throw new Error('Cannot find module \'' + request + '\'');
  }
  return result;
}

function findModule(this: Module, path: string, postfixes: string[]): Module | null {
  if (path) {
    for (const postfix of postfixes) {
      let module = getModule.call(this, path + postfix);
      if (postfix === '/package.json') {
        if (getMain(module)) {
          const normalizedPath = normalizePath(path + '/' + getMain(module));
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
  return null;
}

function getMain(module: Module | null): string | null {
  return module && module.exports && module.exports.main;
}

function getModule(this: Module, url: string): Module | null {
  if (url in this._cache) {
    return this._cache[url] || null;
  }
  if (url.slice(-5) === '.json') {
    const data = Module.readJSON(url);
    if (data) {
      return new Module(url, this, data);
    }
  } else {
    const loader = Module.createLoader(url);
    if (loader) {
      return new Module(url, this, loader);
    }
  }
  this._cache[url] = false;
  return null;
}

function getPostfixes(request: string) {
  return request.slice(-1) === '/' ? FOLDER_POSTFIXES : FILE_POSTFIXES;
}

const modulePrefix = '(function (module, exports, require, __filename, __dirname) { ';
const modulePostfix = '\n});';

function dirname(id: string) {
  if (!id || id.slice(0, 1) !== '.') {
    return './';
  }
  return id.slice(0, id.lastIndexOf('/'));
}

function normalizePath(path: string) {
  const segments = [];
  const pathSegments = path.split('/');
  for (const segment of pathSegments) {
    if (segment === '..') {
      const removed = segments.pop();
      if (!removed || removed === '.') {
        return '';
      }
    } else if (segment === '.' ? segments.length === 0 : segment !== '') {
      segments.push(segment);
    }
  }
  return segments.join('/');
}
