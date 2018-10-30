import NativeObject from '../NativeObject';
import ContentView from './ContentView';

export default class Drawer extends ContentView {

  constructor() {
    if (arguments[0] !== true) {
      throw new Error('Drawer can not be created');
    }
    super(true);
  }

  get _nativeType() {
    return 'tabris.Drawer';
  }

  _setParent() {
    throw new Error('Parent of Drawer can not be changed');
  }

  _listen(name, listening) {
    if (name === 'open' || name === 'close') {
      this._nativeListen(name, listening);
    } else {
      super._listen(name, listening);
    }
  }

  _dispose() {
    throw new Error('Drawer can not be disposed');
  }

  open() {
    this._nativeCall('open', {});
    return this;
  }

  close() {
    this._nativeCall('close', {});
    return this;
  }

}

NativeObject.defineProperties(Drawer.prototype, {
  enabled: {
    type: 'boolean',
    default: false
  }
});

export function create() {
  return new Drawer(true);
}
