import NativeObject from './NativeObject';
import {toValueString} from './Console';

const CERTIFICATE_ALGORITHMS = ['RSA2048', 'RSA4096', 'ECDSA256'];

export default class App extends NativeObject {

  get _nativeType() {
    return 'tabris.App';
  }

  /** @override */
  _nativeCreate(param) {
    if (param !== true) {
      throw new Error('App can not be created');
    }
    super._nativeCreate();
  }

  get id() {
    return this._nativeGet('appId');
  }

  get debugBuild() {
    return this._nativeGet('debugBuild');
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
        throw new Error(`Invalid url: ${toValueString(url)} is not a string`);
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
    const subPath = path != null ? '/' + normalizePath('' + path) : '';
    return this._resourceBaseUrl + subPath;
  }

  dispose() {
    throw new Error('tabris.app can not be disposed');
  }

  reload(url) {
    this._nativeCall('reload', {url});
  }

  close() {
    this._nativeCall('close');
  }

  registerFont(alias, file) {
    if (arguments.length < 2) {
      throw new Error('Not enough arguments to register a font');
    }
    if (typeof alias !== 'string') {
      throw new Error(`Invalid alias: ${toValueString(alias)} is not a string`);
    }
    if (typeof file !== 'string') {
      throw new Error(`Invalid file path: ${toValueString(file)} is not a string`);
    }
    this._nativeCall('registerFont', {alias, file});
  }

  _validateCertificate(event) {
    const hashes = this.$pinnedCerts[event.host];
    if (hashes && !hashes.some(hash => event.hashes.includes(hash))) {
      event.preventDefault();
    }
  }

}

NativeObject.defineProperties(App.prototype, {
  pinnedCertificates: {
    type: 'array',
    default: () => [],
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
          throw new Error(`certificate entry ${toValueString(certificate)} is not an ArrayBuffer`);
        }
      }
      this._storeProperty(name, value);
      this._nativeSet(name, value);
    }
  },
  idleTimeoutEnabled: {type: 'boolean', default: true, set: setIdleTimeoutEnabled}
});

NativeObject.defineEvents(App.prototype, {
  foreground: {native: true},
  background: {native: true},
  pause: {native: true},
  resume: {native: true},
  terminate: {native: true},
  backNavigation: {native: true},
  certificatesReceived: {native: true},
});

function checkCertificates(certificates) {
  const hashes = {};
  for (const cert of certificates) {
    if (typeof cert.host !== 'string') {
      throw new Error(`Invalid host ${toValueString(cert.host)}`);
    }
    if (typeof cert.hash !== 'string' || !cert.hash.startsWith('sha256/')) {
      throw new Error(`Invalid hash ${toValueString(cert.hash)} for pinned certificate ${cert.host}`);
    }
    if (tabris.device.platform === 'iOS') {
      if (!('algorithm' in cert)) {
        throw new Error(`Missing algorithm for pinned certificate ${cert.host}`);
      }
      if (typeof cert.algorithm !== 'string' || CERTIFICATE_ALGORITHMS.indexOf(cert.algorithm) === -1) {
        throw new Error(`Invalid algorithm ${toValueString(cert.algorithm)} for pinned certificate ${cert.host}`);
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
      throw new Error(`Path ${toValueString(path)} must not contain ".."`);
    }
    if (segment === '.') {
      return '';
    }
    return segment;
  }).filter(string => !!string).join('/');
}
