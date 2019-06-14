import NativeObject from './NativeObject';

export default class Permission extends NativeObject {

  /** @override */
  _nativeCreate(param) {
    if (param !== true) {
      throw new Error('Permission can not be created');
    }
    super._nativeCreate();
  }

  get _nativeType() {
    return 'tabris.Permission';
  }

  getAuthorizationStatus(...permissions) {
    Permission.validatePermissions(permissions, 'get authorization status');
    const result = this._nativeCall('getAuthorizationStatus', {permissions});
    if (!result || result.error) {
      throw new Error(!result ? 'No result returned for getAuthorizationStatus()' : result.error);
    } else {
      return result.status;
    }
  }

  isAuthorized(...permissions) {
    Permission.validatePermissions(permissions, 'check if permission is authorized');
    return this.getAuthorizationStatus(...permissions) === 'granted';
  }

  isAuthorizationPossible(...permissions) {
    Permission.validatePermissions(permissions, 'check if authorization is possible');
    const status = this.getAuthorizationStatus(...permissions);
    return status === 'undetermined' || status === 'declined';
  }

  requestAuthorization(...permissions) {
    return new Promise((resolve, reject) => {
      Permission.validatePermissions(permissions, 'request permission authorization');
      this._nativeCall('requestAuthorization', {
        permissions,
        onResult: (result) => {
          if (!result || result.error) {
            reject(new Error(!result ? 'No result returned for requestAuthorization()' : result.error));
          } else {
            resolve(result.status);
          }
        },
      });
    });
  }

  withAuthorization(permission, onAuthorized, onUnauthorized, onError) {
    if (Array.isArray(permission)) {
      if (!permission.every(entry => typeof entry === 'string')) {
        throw new Error('Permissions need to be of type string');
      }
    } else if (typeof permission === 'string') {
      permission = [permission];
    } else {
      throw new Error('Permission needs to be of type string or an array of strings');
    }
    this.requestAuthorization(...permission)
      .then(status => {
        if (status === 'granted' && typeof onAuthorized === 'function') {
          onAuthorized(status);
        } else if (typeof onUnauthorized === 'function') {
          onUnauthorized(status);
        }
      })
      .catch(e => {
        if (typeof onError === 'function') {
          onError(e);
        }
      });
  }

  static validatePermissions(permissions, action) {
    if (permissions.length === 0) {
      throw new Error(`Not enough arguments to ${action}`);
    }
    if (!permissions.every(entry => typeof entry === 'string')) {
      throw new Error('Permissions need to be of type string');
    }
  }

  dispose() {
    throw new Error('Cannot dispose permission object');
  }

}

export function create() {
  return new Permission(true);
}
