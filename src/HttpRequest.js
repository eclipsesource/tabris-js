import NativeObject from './NativeObject';

export default class HttpRequest extends NativeObject {

  constructor() {
    super();
    this._create('tabris.HttpRequest');
    this._nativeListen('stateChanged', true);
    this._nativeListen('downloadProgress', true);
    this._nativeListen('uploadProgress', true);
  }

  abort() {
    this._nativeCall('abort', {});
  }

  send(config) {
    this._nativeCall('send', config);
  }

}
