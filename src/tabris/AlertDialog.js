import Popup from './Popup';
import NativeObject from './NativeObject';
import {capitalizeFirstChar} from './util';

export default class AlertDialog extends Popup {

  constructor(properties) {
    super();
    this._create('tabris.AlertDialog', properties);
    this._nativeListen('close', true);
    this._autoDispose = true;
  }

  _trigger(name, event) {
    if (name === 'close') {
      event.button = event.button || '';
      if (event.button) {
        super._trigger('close' + capitalizeFirstChar(event.button), event);
      }
      super._trigger('close', event);
      this.dispose();
    } else {
      return super._trigger(name, event);
    }
  }

}

NativeObject.defineProperties(AlertDialog.prototype, {
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
});
