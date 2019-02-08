import NativeObject from './NativeObject';

export default class InactivityTimer extends NativeObject {

  constructor(properties) {
    super(properties);
    this._nativeListen('timeout', true);
  }

  start() {
    this._nativeCall('start');
  }

  cancel() {
    this._nativeCall('cancel');
  }

  get _nativeType() {
    return 'tabris.InactivityTimer';
  }

}

NativeObject.defineProperties(InactivityTimer.prototype, {
  delay: {
    type: 'natural',
    default: 0
  }
});
