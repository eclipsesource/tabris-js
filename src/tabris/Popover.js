import NativeObject from './NativeObject';
import Popup from './Popup';
import {create as createContentView} from './widgets/ContentView';

export default class Popover extends Popup {

  constructor(properties) {
    super();
    Object.defineProperty(this, 'contentView', {value: createContentView()});
    this._create('tabris.Popover', properties);
    this._nativeListen('close', true);
    this._autoDispose = true;
    this._nativeSet('contentView', this.contentView.cid);
  }

  get _nativeType() {
    return 'tabris.Popover';
  }

  _trigger(name, event) {
    if (name === 'close') {
      super._trigger('close', event);
      this.dispose();
    } else {
      return super._trigger(name, event);
    }
  }

}

NativeObject.defineProperties(Popover.prototype, {
  anchor: {type: 'NativeObject', default: null},
  width: {type: 'dimension', nocache: true},
  height: {type: 'dimension', nocache: true},
});

NativeObject.defineEvents(Popover.prototype, {
  close: {}
});
