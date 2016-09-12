import NativeObject from './NativeObject';

export default NativeObject.extend({

  _type: 'tabris.InactivityTimer',

  _properties: {
    delay: {
      type: 'natural',
      default: 0
    }
  },

  _events: {
    timeout: {
      trigger() {
        this.trigger('timeout', this, {});
      }
    }
  },

  start() {
    this._nativeCall('start');
  },

  cancel() {
    this._nativeCall('cancel');
  }

});
