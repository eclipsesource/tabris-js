import NativeObject from './NativeObject';

const CERTIFICATE_ALGORITHMS = ['RSA2048', 'RSA4096', 'ECDSA256'];

const CONFIG = {
  _cid: 'tabris.App',
  _properties: {
    pinnedCertificates: {
      type: 'array',
      default() {
        return [];
      },
      access: {
        set(name, value) {
          for (let cert of value) {
            if (typeof cert.host !== 'string') {
              throw new Error('Invalid host for pinned certificate: ' + cert.host);
            }
            if (typeof cert.hash !== 'string' || !cert.hash.startsWith('sha256/')) {
              throw new Error('Invalid hash for pinned certificate: ' + cert.hash);
            }
            if (tabris.device.platform === 'iOS') {
              if (!('algorithm' in cert)) {
                throw new Error('Missing algorithm for pinned certificate: ' + cert.host);
              }
              if (typeof cert.algorithm !== 'string' || CERTIFICATE_ALGORITHMS.indexOf(cert.algorithm) === -1) {
                throw new Error('Invalid algorithm for pinned certificate: ' + cert.algorithm);
              }
            }
          }
          this._storeProperty(name, value);
          this._nativeSet(name, value);
        }
      }
    }
  },
  _events: {
    foreground: true,
    resume: true,
    pause: true,
    background: true,
    terminate: true,
    open: 'Open',
    patchInstall: true,
    backnavigation: true
  },
};

export default class App extends NativeObject.extend(CONFIG) {

  constructor() {
    super();
    if (arguments[0] !== true) {
      throw new Error('App can not be created');
    }
  }

  getResourceLocation(path) {
    if (!this._resourceBaseUrl) {
      this._resourceBaseUrl = this._nativeGet('resourceBaseUrl');
    }
    let subPath = path != null ? '/' + normalizePath('' + path) : '';
    return this._resourceBaseUrl + subPath;
  }

  dispose() {
    throw new Error('tabris.app can not be disposed');
  }

  reload() {
    this._nativeCall('reload', {});
  }

  installPatch(url, callback) {
    if (typeof url !== 'string') {
      throw new Error('parameter url is not a string');
    }
    if (!this._pendingPatchCallback) {
      this._pendingPatchCallback = callback || true;
      this._listen('patchInstall', true);
      this._nativeCall('installPatch', {url});
    } else if (typeof callback === 'function') {
      callback(new Error('Another installPatch operation is already pending.'));
    }
  }

  _trigger(name, event) {
    if (name === 'backnavigation') {
      let cancelled = false;
      this.trigger('backnavigation', {
        target: this,
        preventDefault() {
          cancelled = true;
        }
      });
      return cancelled;
    } else if (name === 'patchInstall') {
      this._listen('patchInstall', false);
      let callback = this._pendingPatchCallback;
      delete this._pendingPatchCallback;
      if (typeof callback === 'function') {
        if (event.error) {
          callback(new Error(event.error));
        } else {
          try {
            let patch = event.success ? JSON.parse(event.success) : null;
            callback(null, patch);
          } catch (error) {
            callback(new Error('Failed to parse patch.json'));
          }
        }
      }
    } else {
      super._trigger(name, event);
    }
  }

}

export function create() {
  let app = new App(true);
  Object.defineProperty(app, 'id', {get: () => app._nativeGet('appId')});
  Object.defineProperty(app, 'version', {get: () => app._nativeGet('version')});
  Object.defineProperty(app, 'versionCode', {get: () => app._nativeGet('versionId')});
  return app;
}

function normalizePath(path) {
  return path.split(/\/+/).map((segment) => {
    if (segment === '..') {
      throw new Error("Path must not contain '..'");
    }
    if (segment === '.') {
      return '';
    }
    return segment;
  }).filter(string => !!string).join('/');
}
