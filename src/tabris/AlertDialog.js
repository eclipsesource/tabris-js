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
    'close': true
  }

};

export default class AlertDialog extends NativeObject.extend(CONFIG) {

  _create(type, properties) {
    super._create(type, properties);
    this._nativeListen('close', true);
    return this;
  }

  _trigger(name, event) {
    if (name === 'close') {
      if (event.button) {
        this.trigger('close:' + event.button, {target: this});
      }
      this.trigger('close', {target: this, button: event.button || ''});
      this.dispose();
    } else {
      super._trigger(name, event);
    }
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
