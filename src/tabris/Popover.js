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

  _listen(name, listening) {
    if (name === 'close') {
      this._nativeListen(name, listening);
    } else {
      super._listen(name, listening);
    }
  }

}

NativeObject.defineProperties(Popover.prototype, {
  anchor: {type: 'proxy', default: null},
  width: {type: 'dimension', nocache: true},
  height: {type: 'dimension', nocache: true},
});
