import NativeObject from './NativeObject';

const CONFIG = {

  _type: 'tabris.AlertDialog',

  _name: 'AlertDialog',

  _properties: {
    title: {type: 'string', default: ''},
    message: {type: 'string', default: ''},
    buttons: {
      type: {
        encode(value) {
          if (typeof value !== 'object') {
            throw new Error('value is not an object');
          }
          let encoded = {};
          if ('ok' in value) {
            encoded.ok = value.ok + '';
          }
          if ('cancel' in value) {
            encoded.cancel = value.cancel + '';
          }
          if ('neutral' in value) {
            encoded.neutral = value.neutral + '';
          }
          return encoded;
        }
      },
      default: () => ({})
    }
  },

  _events: {
    'close': {
      trigger(name, event) {
        if (event.button) {
          this.trigger('close:' + event.button, this);
        }
        this.trigger('close', this, event.button || '');
        this.dispose();
      }
    }
  }

};

export default class AlertDialog extends NativeObject.extend(CONFIG) {

  _create(type, properties) {
    super._create(type, properties);
    this._nativeListen('close', true);
    return this;
  }

  open() {
    if (this.isDisposed()) {
      throw new Error('Can not open a dialog that was closed');
    }
    this._nativeCall('open');
    return this;
  }

  close() {
    this.dispose();
    return this;
  }

}
