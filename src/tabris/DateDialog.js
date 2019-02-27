import Popup from './Popup';
import NativeObject from './NativeObject';

export default class DateDialog extends Popup {

  static open(value) {
    let dateDialog;
    if (value instanceof DateDialog) {
      dateDialog = value;
    } else if (value instanceof Date) {
      dateDialog = new DateDialog({date: value});
    } else {
      dateDialog = new DateDialog();
    }
    return dateDialog.open();
  }

  /**
   * @param {Partial<DateDialog>=} properties
   */
  constructor(properties) {
    super(properties);
    this._nativeListen('close', true);
    this._nativeListen('select', true);
    this._autoDispose = true;
  }

  get _nativeType() {
    return 'tabris.DateDialog';
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

}

NativeObject.defineProperties(DateDialog.prototype, {
  date: {type: 'any', default: null, set: setDate},
  maxDate: {type: 'any', default: null, set: setDate},
  minDate: {type: 'any', default: null, set: setDate}
});

NativeObject.defineEvents(DateDialog.prototype, {
  select: {native: true},
  close: {native: true}
});

function setDate(name, value) {
  if (value instanceof Date) {
    this._nativeSet(name, value.getTime());
    this._storeProperty(name, value);
  } else {
    throw new Error(`${name} is not of type Date`);
  }
}
