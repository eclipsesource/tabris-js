import Popup from './Popup';
import NativeObject from './NativeObject';
import {capitalizeFirstChar} from './util';
import TextInput from './widgets/TextInput';

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

  _dispose() {
    if (!this.isDisposed() && this.textInputs instanceof Array) {
      this.textInputs.forEach(textInput => textInput.dispose());
    }
    super._dispose();
  }

}

NativeObject.defineProperties(AlertDialog.prototype, {
  title: {type: 'string', default: ''},
  message: {type: 'string', default: ''},
  textInputs: {
    type: {
      encode(textInputs) {
        if (textInputs instanceof Array) {
          return textInputs.map((textInput) => {
            if (!(textInput instanceof TextInput)) {
              throw new Error('Only TextInput widgets are allowed');
            }
            return textInput.cid;
          });
        }
        throw new Error('TextInputs is not of type Array');
      },
      decode(cids) {
        if (cids instanceof Array) {
          return cids
            .map(cid => tabris._proxies.find(cid))
            .filter(textInput => textInput != null);
        }
        return null;
      }
    }
  },
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

NativeObject.defineEvents(AlertDialog.prototype, {
  close: true,
  closeOk: true,
  closeCancel: true,
  closeNeutral: true
});
