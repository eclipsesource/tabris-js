import NativeObject from './NativeObject';

const CERTIFICATE_ALGORITHMS = ['RSA2048', 'RSA4096', 'ECDSA256'];
const EVENT_TYPES = ['foreground', 'background', 'pause', 'resume', 'terminate', 'backNavigation',
  'certificatesReceived'];

export default class App extends NativeObject {

  constructor() {
    super();
    if (arguments[0] !== true) {
      throw new Error('App can not be created');
    }
    this._create('tabris.App');
  }

  get id() {
    return this._nativeGet('appId');
  }

  get version() {
    return this._nativeGet('version');
  }

  get versionCode() {
    return this._nativeGet('versionId');
  }

  launch(url) {
    return new Promise((resolve, reject) => {
      if (arguments.length < 1) {
        throw new Error('Not enough arguments to launch');
      }
      if (typeof url !== 'string') {
        throw new Error('url is not a string');
      }
      this._nativeCall('launch', {
        url,
        onError: (err) => reject(new Error(err)),
        onSuccess: () => resolve()
      });
    });
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

  close() {
    this._nativeCall('close');
  }

  registerFont(alias, file) {
    if (arguments.length < 2) {
      throw new Error('Not enough arguments to register a font');
    }
    if (typeof alias !== 'string') {
      throw new Error('alias is not a string');
    }
    if (typeof file !== 'string') {
      throw new Error('file is not a string');
    }
    this._nativeCall('registerFont', {alias, file});
  }

  installPatch(url, callback) {
    if (typeof url !== 'string') {
      throw new Error('parameter url is not a string');
    }
    if (!this._pendingPatchCallback) {
      this._pendingPatchCallback = callback || true;
      this._nativeListen('patchInstall', true);
      this._nativeCall('installPatch', {url});
    } else if (typeof callback === 'function') {
      callback(new Error('Another installPatch operation is already pending.'));
    }
  }

  _listen(name, listening) {
    if (EVENT_TYPES.includes(name)) {
      this._nativeListen(name, listening);
    } else {
      super._listen(name, listening);
    }
  }

  _trigger(name, event = {}) {
    if (name === 'patchInstall') {
      this._nativeListen('patchInstall', false);
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
      return super._trigger(name, event);
    }
  }

  _validateCertificate(event) {
    let hashes = this.$pinnedCerts[event.host];
    if (hashes && !hashes.some(hash => event.hashes.includes(hash))) {
      event.preventDefault();
    }
  }

}

NativeObject.defineProperties(App.prototype, {
  pinnedCertificates: {
    type: 'array',
    default() {
      return [];
    },
    set(name, value) {
      this.$pinnedCerts = checkCertificates(value);
      this.on('certificatesReceived', this._validateCertificate, this);
      this._storeProperty(name, value);
      this._nativeSet(name, value);
    }
  },
  trustedCertificates: {
    type: 'array',
    default: () => [],
    set(name, value) {
      for (let i = 0; i < value.length; i++) {
        const certificate = value[i];
        if (!(certificate instanceof ArrayBuffer)) {
          throw new Error('The trustedCertificates array entries have to be of type ArrayBuffer but contain '
            + certificate);
        }
      }
      this._storeProperty(name, value);
      this._nativeSet(name, value);
    }
  },
  idleTimeoutEnabled: {type: 'boolean', default: true, set: setIdleTimeoutEnabled}
});

function checkCertificates(certificates) {
  let hashes = {};
  for (let cert of certificates) {
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
    hashes[cert.host] = hashes[cert.host] || [];
    hashes[cert.host].push(cert.hash);
  }
  return hashes;
}

function setIdleTimeoutEnabled(name, value) {
  if (!tabris.contentView) {
    throw new Error('The device property "idleTimeoutEnabled" can only be changed in main context.');
  }
  this._nativeSet(name, value);
  this._storeProperty(name, value);
}

export function create() {
  return new App(true);
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
