import NativeObject from './NativeObject';

const ERRORS = {
  EACCES: 'Permission denied',
  EEXIST: 'File exists',
  ENOENT: 'No such file or directory',
  EISDIR: 'Is a directory',
  ENOTDIR: 'Not a directory',
  ENOTEMPTY: 'Directory not empty'
};

export default class FileSystem extends NativeObject {

  constructor() {
    super('tabris.FileSystem');
    if (arguments[0] !== true) {
      throw new Error('FileSystem can not be created');
    }
    this._create('tabris.FileSystem');
  }

  get filesDir() {
    return this._nativeGet('filesDir');
  }

  get cacheDir() {
    return this._nativeGet('cacheDir');
  }

  readFile(path) {
    return new Promise((resolve, reject) => {
      if (arguments.length < 1) {
        throw new Error('Not enough arguments to readFile');
      }
      this._nativeCall('readFile', {
        path: normalizePath(path),
        onError: (err) => reject(createError(err, path)),
        onSuccess: (data) => resolve(data)
      });
    });
  }

  writeFile(path, data) {
    return new Promise((resolve, reject) => {
      if (arguments.length < 2) {
        throw new Error('Not enough arguments to writeFile');
      }
      this._nativeCall('writeFile', {
        path: normalizePath(path),
        data: checkBuffer(data),
        onError: (err) => reject(createError(err, path)),
        onSuccess: () => resolve()
      });
    });
  }

  removeFile(path) {
    return new Promise((resolve, reject) => {
      if (arguments.length < 1) {
        throw new Error('Not enough arguments to removeFile');
      }
      this._nativeCall('removeFile', {
        path: normalizePath(path),
        onError: (err) => reject(createError(err, path)),
        onSuccess: () => resolve()
      });
    });
  }

  dispose() {
    throw new Error('Cannot dispose fs object');
  }

}

export function create() {
  return new FileSystem(true);
}

export function createError(err, path) {
  let message = `${ERRORS[err] || err}: ${path}`;
  let code = err in ERRORS ? err : null;
  let error = new Error(message);
  Object.defineProperties(error, {
    path: {value: path},
    code: {value: code}
  });
  return error;
}

export function normalizePath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string');
  }
  if (!path.startsWith('/')) {
    throw new Error('Path must be absolute');
  }
  return '/' + path.split(/\/+/).map((segment) => {
    if (segment === '..') {
      throw new Error("Path must not contain '..'");
    }
    return segment === '.' ? '' : segment;
  }).filter(string => !!string).join('/');
}

function checkBuffer(buffer) {
  if (ArrayBuffer.isView(buffer)) {
    buffer = buffer.buffer;
  }
  if (!(buffer instanceof ArrayBuffer)) {
    throw new Error('Invalid buffer type');
  }
  return buffer;
}
