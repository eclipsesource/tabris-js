/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-invalid-this */
const FILE_POSTFIXES = ['', '.js', '.json', '/package.json', '/index.js', '/index.json'];
const FOLDER_POSTFIXES = ['/package.json', '/index.js', '/index.json'];
const MODULE_PREFIX = '(function (module, exports, require, __filename, __dirname) { ';
const MODULE_POSTFIX = '\n});';

export type ModuleLoader = (
  module: Module,
  exports: any,
  require: Module['require'],
  filename: string,
  dirname: string
) => any;

export type AddPathOptions = {
  baseUrl?: string,
  paths: {[pattern: string]: string[]}
};

export default class Module {

  public static root: Module;

  public readonly id: string;
  public readonly parent: Module | null;
  public exports: any = {};
  protected readonly _cache: { [id: string]: Module | false } = {};
  protected readonly _paths: { [pattern: string]: string[] } = {};

  constructor(id?: string, parent?: Module | null, content?: ModuleLoader | object) {
    this.id = id || '';
    this.parent = parent || null;
    let exports = {};
    let resolved = false;
    const require = this.require.bind(this);
    Object.defineProperty(this, '_cache', {
      enumerable: false, writable: false, value: this.parent ? this.parent._cache : this._cache
    });
    Object.defineProperty(this, '_paths', {
      enumerable: false, writable: false, value: this.parent ? this.parent._paths : this._paths
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
    checkBrowserField(this);
  }

  public require(request: string) {
    if (request.slice(0, 1) !== '.') {
      const cached = this._cache[request];
      if (cached) {
        return cached.exports;
      }
      const mapped = findMappedModule.call(this, request);
      if (mapped) {
        return mapped.exports;
      }
      this._cache[request] = false;
      return findNodeModule.call(this, request).exports;
    }
    return findFileModule.call(this, request).exports;
  }

  static createLoader(url: string): ModuleLoader | null {
    let result;
    try {
      result = tabris._client.loadAndExecute(url, MODULE_PREFIX, MODULE_POSTFIX);
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
        throw new Error('Could not parse ' + url + ': ' + ex.message);
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

  static define(path: string, exports: any) {
    if (arguments.length !== 2) {
      throw new Error(`Expected exactly 2 arguments, got ${arguments.length}`);
    }
    if (typeof path !== 'string') {
      throw new Error('Expected argument 1 to be of type string');
    }
    if (path.charAt(0) !== '/') {
      throw new Error('Path needs to start with a "/"');
    }
    const id = '.' + path;
    if (Module.root._cache[id]) {
      throw new Error(`Module "${path}" is already defined'`);
    }
    if (Module.root._cache[id] === false) {
      throw new Error(`Module "${path}" was accessed before it was defined'`);
    }
    if (exports instanceof Module) {
      throw new Error('Expected argument 2 to be module exports, got a module instance');
    }
    new Module('.' + path, this.root, module => module.exports = exports);
  }

  static addPath(pattern: string, alias: string[]): void;
  static addPath(options: AddPathOptions): void;
  static addPath(arg1: string | AddPathOptions, arg2?: string[]) {
    if (arg1 instanceof Object) {
      checkAddPathOptions(arg1);
      for (const pattern in arg1.paths) {
        const paths = arg1.paths[pattern];
        if (!Array.isArray(paths) || paths.some(path => typeof path !== 'string')) {
          throw new Error(`Expected paths for pattern "${pattern}" to be array of strings`);
        }
        this.addPath(
          pattern,
          paths.map(path => arg1.baseUrl ? ('./' + normalizePath(arg1.baseUrl + '/' + path)) : path)
        );
      }
    } else {
      if (arguments.length <= 1) {
        throw new Error('Expected argument 1 to be of type object');
      }
      checkAddPathArgs(arg1, arg2);
      if (this.root._paths[arg1]) {
        throw new Error(`Pattern "${arg1}" is already registered`);
      }
      const prefix = arg1.split('*')[0];
      if (Object.keys(this.root._cache).some(request => request.startsWith(prefix))) {
        throw new Error(`Can not add pattern "${arg1}" since a matching module was already imported'`);
      }
      this.root._paths[arg1] = arg2;
    }
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

function findMappedModule(this: Module, request: string): Module | null {
  if (this.id.indexOf('/node_modules') !== -1) {
    return null;
  }
  // Based on https://github.com/Microsoft/TypeScript/issues/5039#pathMappings
  let matchedPattern: string | undefined;
  let matchedWildcard: string | undefined;
  let longestMatchedPrefixLength = 0;
  for (const pattern in this._paths) {
    const indexOfWildcard = pattern.indexOf('*');
    if (indexOfWildcard !== -1) {
      const prefix = pattern.substr(0, indexOfWildcard);
      const suffix = pattern.substr(indexOfWildcard + 1);
      if (request.length >= prefix.length + suffix.length
        && request.startsWith(prefix)
        && request.endsWith(suffix)
        && longestMatchedPrefixLength < prefix.length
      ) {
        longestMatchedPrefixLength = prefix.length;
        matchedPattern = pattern;
        matchedWildcard = request.substr(prefix.length, request.length - suffix.length);
      }
    } else if (pattern === request) {
      matchedPattern = pattern;
      matchedWildcard = undefined;
      break;
    }
  }
  if (!matchedPattern) {
    return null;
  }
  const attempts: string[] = [];
  for (const subst of this._paths[matchedPattern]) {
    const path = matchedWildcard ? subst.replace('*', matchedWildcard) : subst;
    attempts.push(path);
    const module = findModule.call(this, path, getPostfixes(request));
    if (module) {
      return module;
    }
  }
  throw new Error(`Cannot find module "${request}" at "${attempts.join('" or "')}"`);
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

function checkBrowserField(module: Module | null) {
  if (module?.id.endsWith('package.json') && module.exports && 'browser' in module.exports) {
    const msg = module.id + ' has a "browser" field.\nThis module may function better with a file bundler';
    if (console.print) {
      console.print('warn', msg);
    } else {
      (console as any).warn(msg);
    }
  }
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

function checkAddPathOptions(arg1: AddPathOptions) {
  if (!('paths' in arg1)) {
    throw new Error('Missing option "paths"');
  }
  if (!(arg1.paths instanceof Object)) {
    throw new Error('Expected option "paths" to be an object');
  }
  if (('baseUrl' in arg1) && typeof arg1.baseUrl !== 'string') {
    throw new Error('Expected option "baseUrl" to be a string');
  }
  if (arg1.baseUrl && !arg1.baseUrl.startsWith('/')) {
    throw new Error('Expected baseUrl to start with "/"');
  }
}

function checkAddPathArgs(arg1: string, arg2: string[] | undefined): asserts arg2 is string[] {
  if (typeof arg1 !== 'string') {
    throw new Error('Expected argument 1 to be of type string');
  }
  if (!Array.isArray(arg2)) {
    throw new Error(`Expected paths for pattern "${arg1}" to be array of strings`);
  }
  if (arg2.some(path => typeof path !== 'string')) {
    throw new Error(`Expected paths for pattern "${arg1}" to be array of strings`);
  }
  if (arg1 === '') {
    throw new Error('Pattern not be empty string');
  }
  if (/^[./]./.test(arg1)) {
    throw new Error(`Pattern may not start with "${arg1.charAt(0)}"`);
  }
  if (arg1.split('*').length > 2) {
    throw new Error('Pattern may contain only one "*"');
  }
  if (arg1.includes(' ')) {
    throw new Error('Pattern may not contain spaces');
  }
  if (arg2.length === 0) {
    throw new Error(`Paths array for pattern "${arg1}" is empty`);
  }
  const wildcard = arg1.includes('*');
  arg2.forEach(path => {
    if (!path.startsWith('./')) {
      throw new Error(`Expected path "${path}" for pattern "${arg1}" to start with "./"`);
    }
    const pathWildcards = path.split('*').length - 1;
    if (wildcard) {
      if (pathWildcards !== 1) {
        throw new Error(`Expected path "${path}" for pattern "${arg1}" to contain exactly one "*"`);
      }
    }
    else if (pathWildcards !== 0) {
      throw new Error(`Expected path "${path}" for pattern "${arg1}" to not contain "*"`);
    }
  });
}
