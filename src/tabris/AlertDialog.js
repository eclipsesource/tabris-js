import Popup from './Popup';
import NativeObject from './NativeObject';
import {capitalizeFirstChar, allowOnlyKeys} from './util';
import TextInput from './widgets/TextInput';
import {JSX} from './JsxProcessor';
import {create as createContentView} from './widgets/ContentView';
import {hint} from './Console';
import Composite from './widgets/Composite';
import {types} from './property-types';

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
  }

  get _nativeType() {
    return 'tabris.AlertDialog';
  }

  get textInputs() {
    if (!this._contentView) {
      Object.defineProperty(this, '_contentView', {
        enumerable: false,
        writable: false,
        value: createContentView({
          layout: null,
          childType: TextInput,
          phantom: true
        })
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

  _handleClose(event) {
    event.button = event.button || null;
    event.texts = [];
    if (this._contentView) {
      event.texts = this._contentView.children().toArray().map(textInput => textInput.text);
    }
    if (event.button) {
      this._trigger('close' + capitalizeFirstChar(event.button), event);
    }
    return super._handleClose(event);
  }

  _dispose() {
    if (!this.isDisposed() && this._contentView) {
      Composite.prototype._dispose.call(this._contentView, true);
    }
    super._dispose();
  }

}

NativeObject.defineProperties(AlertDialog.prototype, {
  title: {type: types.string, default: ''},
  message: {type: types.string, default: ''},
  buttons: {
    type: {
      convert(value) {
        allowOnlyKeys(value, ['ok', 'cancel', 'neutral']);
        const result = {};
        if ('ok' in value) { result.ok = value.ok + ''; }
        if ('cancel' in value) { result.cancel = value.cancel + ''; }
        if ('neutral' in value) { result.neutral = value.neutral + ''; }
        return Object.freeze(result);
      }
    },
    default: Object.freeze({})
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
