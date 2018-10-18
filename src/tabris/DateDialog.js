import Popup from './Popup';
import NativeObject from './NativeObject';

export default class DateDialog extends Popup {

  constructor(properties) {
    super();
    this._create('tabris.DateDialog', properties);
    this._nativeListen('close', true);
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
    throw new Error('date is not of type Date');
  }
}
