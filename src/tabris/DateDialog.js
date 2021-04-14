import Popup from './Popup';
import NativeObject from './NativeObject';
import {types} from './property-types';

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
  }

  get _nativeType() {
    return 'tabris.DateDialog';
  }

  _trigger(name, event) {
    if (name === 'select') {
      event.date = new Date(event.date);
      super._trigger('select', event);
      return this._handleClose(event);
    } else {
      return super._trigger(name, event);
    }
  }

}

NativeObject.defineProperties(DateDialog.prototype, {
  date: {type: types.Date, default: null},
  maxDate: {type: types.Date, default: null},
  minDate: {type: types.Date, default: null}
});

NativeObject.defineEvents(DateDialog.prototype, {
  select: {native: true},
  close: {native: true}
});
