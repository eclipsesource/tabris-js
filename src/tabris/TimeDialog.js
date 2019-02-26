import Popup from './Popup';
import NativeObject from './NativeObject';
import {jsxFactory} from './JsxProcessor';

export default class TimeDialog extends Popup {

  static open(value) {
    let timeDialog;
    if (value instanceof TimeDialog) {
      timeDialog = value;
    } else if (value instanceof Date) {
      timeDialog = new TimeDialog({date: value});
    } else {
      timeDialog = new TimeDialog();
    }
    return timeDialog.open();
  }

  /**
   * @param {Partial<TimeDialog>=} properties
   */
  constructor(properties) {
    super(properties);
    this._nativeListen('close', true);
    this._nativeListen('select', true);
    this._autoDispose = true;
  }

  get _nativeType() {
    return 'tabris.TimeDialog';
  }

  _trigger(name, event) {
    if (name === 'close') {
      this._handleCloseEvent(event);
    } else if (name === 'select') {
      event.date = new Date(event.date);
      super._trigger('select', event);
      this._handleCloseEvent(event);
    } else {
      return super._trigger(name, event);
    }
  }

  _handleCloseEvent(event) {
    super._trigger('close', event);
    this.dispose();
  }

  /** @this {import("../JsxProcessor").default} */
  [jsxFactory](Type, props) {
    return this.createNativeObject(Type, props);
  }

}

NativeObject.defineProperties(TimeDialog.prototype, {
  date: {type: 'any', default: null, set: setDate},
});

NativeObject.defineEvents(TimeDialog.prototype, {
  select: {native: true},
  close: {native: true}
});

function setDate(name, value) {
  if (value instanceof Date) {
    this._nativeSet(name, value.getTime());
    this._storeProperty(name, value);
  } else {
    throw new Error('date is not of type Date');
  }
}
