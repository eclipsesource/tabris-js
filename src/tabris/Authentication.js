import NativeObject from './NativeObject';
import checkType from './checkType';

export default class Authentication extends NativeObject {

  /** @override */
  _nativeCreate(param) {
    if (param !== true) {
      throw new Error('Authentication can not be created');
    }
    super._nativeCreate();
  }

  get _nativeType() {
    return 'tabris.Authentication';
  }

  canAuthenticate(options = {}) {
    checkType(options.allowCredentials, Boolean, {name: 'allowCredentials', nullable: true});
    return this._nativeCall('canAuthenticate', options);
  }

  authenticate(options = {}) {
    return new Promise((resolve, reject) => {
      checkType(options.title, String, {name: 'title', nullable: true});
      checkType(options.subtitle, String, {name: 'subtitle', nullable: true});
      checkType(options.message, String, {name: 'message', nullable: true});
      checkType(options.allowCredentials, Boolean, {name: 'allowCredentials', nullable: true});
      checkType(options.confirmationRequired, Boolean, {name: 'confirmationRequired', nullable: true});
      this._nativeCall('authenticate', {
        options,
        onResult: (result) => resolve(result),
        onError: (error) => reject(new Error(error))
      });
    });
  }

  cancel() {
    this._nativeCall('cancel');
  }

  dispose() {
    throw new Error('Cannot dispose authentication object');
  }

}

NativeObject.defineProperties(Authentication.prototype, {
  availableBiometrics: {readonly: true}
});

export function create() {
  return new Authentication(true);
}
