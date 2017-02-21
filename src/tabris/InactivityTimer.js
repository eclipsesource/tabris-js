import NativeObject from './NativeObject';

export default class InactivityTimer extends NativeObject {

  constructor(properties) {
    super();
    this._create('tabris.InactivityTimer', properties);
    this._nativeListen('timeout', true);
  }

  start() {
    this._nativeCall('start');
  }

  cancel() {
    this._nativeCall('cancel');
  }

}

NativeObject.defineProperties(InactivityTimer.prototype, {
  delay: {
    type: 'natural',
    default: 0
  }
});
