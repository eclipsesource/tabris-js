import Popup from './Popup';
import NativeObject from './NativeObject';
import {capitalizeFirstChar} from './util';
import TextInput from './widgets/TextInput';
import {JSX} from './JsxProcessor';
import {create as createContentView} from './widgets/ContentView';
import {hint, toValueString} from './Console';
import Composite from './widgets/Composite';

export default class AlertDialog extends Popup {

  static open(value) {
    let alertDialog;
    if (value instanceof AlertDialog) {
      alertDialog = value;
    } else {
      alertDialog = new AlertDialog({message: value, buttons: {ok: 'OK'}});
    }
    return alertDialog.open();
  }

  constructor(properties) {
    super(properties);
    this._nativeListen('close', true);
    this._autoDispose = true;
  }

  get _nativeType() {
    return 'tabris.AlertDialog';
  }

  get textInputs() {
    if (!this._contentView) {
      this._contentView = createContentView({
        layout: null,
        childType: TextInput,
        phantom: true
      });
    }
    return this._contentView;
  }

  set textInputs(value) {
    hint(this, 'Property "textInputs" can not be set, append to it instead');
  }

  open() {
    if (!this.isDisposed() && this._contentView) {
      this._nativeSet('textInputs', this._contentView.children().toArray().map(object => object.cid));
    }
    return super.open();
  }

  _trigger(name, event) {
    if (name === 'close') {
      event.button = event.button || null;
      event.texts = [];
      if (this._contentView) {
        event.texts = this._contentView.children().toArray().map(textInput => textInput.text);
      }
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
    if (!this.isDisposed() && this._contentView) {
      Composite.prototype._dispose.call(this._contentView, true);
    }
    super._dispose();
  }

}

NativeObject.defineProperties(AlertDialog.prototype, {
  title: {type: 'string', default: ''},
  message: {type: 'string', default: ''},
  buttons: {
    type: {
      encode(value) {
        if (typeof value !== 'object') {
          throw new Error(toValueString(value) + ' is not an object');
        }
        const encoded = {};
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

AlertDialog.prototype[JSX.jsxFactory] = createElement;

/** @this {import("./JsxProcessor").default} */
function createElement(Type, attributes) {
  const children = this.getChildren(attributes) || [];
  let normalAttributes = this.withoutChildren(attributes);
  normalAttributes = this.withContentText(
    normalAttributes,
    children.filter(child => !(child instanceof Object)),
    'message'
  );
  const textInputs = children.filter(child => child instanceof Object);
  const result = Popup.prototype[JSX.jsxFactory].call(
    this,
    Type,
    normalAttributes
  );
  if (children && children.length) {
    result.textInputs.append(textInputs);
  }
  return result;
}
