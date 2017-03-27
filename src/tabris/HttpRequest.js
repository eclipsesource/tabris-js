import NativeObject from './NativeObject';

export default class HttpRequest extends NativeObject {

  constructor() {
    super();
    this._create('tabris.HttpRequest');
    this._nativeListen('StateChange', true);
    this._nativeListen('DownloadProgress', true);
    this._nativeListen('UploadProgress', true);
  }

  abort() {
    this._nativeCall('abort', {});
  }

  send(config) {
    this._nativeCall('send', config);
  }

}
