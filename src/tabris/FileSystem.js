import NativeObject from './NativeObject';
import {normalizePath} from './util';

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
        path: checkPath(path),
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
        path: checkPath(path),
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
        path: checkPath(path),
        onError: (err) => reject(createError(err, path)),
        onSuccess: () => resolve()
      });
    });
  }

  readDir(path) {
    return new Promise((resolve, reject) => {
      if (arguments.length < 1) {
        throw new Error('Not enough arguments to readDir');
      }
      this._nativeCall('readDir', {
        path: checkPath(path),
        onError: (err) => reject(createError(err, path)),
        onSuccess: (data) => resolve(data)
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

function checkPath(path) {
  try {
    return normalizePath(path);
  } catch (err) {
    throw new Error('Invalid file name: ' + err.message);
  }
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
