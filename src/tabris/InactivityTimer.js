import NativeObject from './NativeObject';

const CONFIG = {

  _type: 'tabris.InactivityTimer',

  _properties: {
    delay: {
      type: 'natural',
      default: 0
    }
  },

  _events: {
    timeout: true
  }

};

export default class InactivityTimer extends NativeObject.extend(CONFIG) {

  start() {
    this._nativeCall('start');
  }

  cancel() {
    this._nativeCall('cancel');
  }

}
