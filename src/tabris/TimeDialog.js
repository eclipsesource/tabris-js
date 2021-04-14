import Popup from './Popup';
import NativeObject from './NativeObject';
import {types} from './property-types';

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
  }

  get _nativeType() {
    return 'tabris.TimeDialog';
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

NativeObject.defineProperties(TimeDialog.prototype, {
  date: {type: types.Date, default: null}
});

NativeObject.defineEvents(TimeDialog.prototype, {
  select: {native: true},
  close: {native: true}
});
