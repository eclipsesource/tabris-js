import NativeObject from '../NativeObject';
import Composite from './Composite';

export default class Drawer extends Composite {

  constructor() {
    if (arguments[0] !== true) {
      throw new Error('Drawer can not be created');
    }
    super();
  }

  get _nativeType() {
    return 'tabris.Drawer';
  }

  _setParent(parent, index) {
    if (this._parent) {
      throw new Error('Parent of Drawer can not be changed');
    }
    super._setParent(parent, index);
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
  },
  win_targetView: {
    type: 'proxy'
  },
  win_displayMode: {
    type: ['choice', ['overlay', 'compactOverlay', 'inline', 'compactInline']],
    default: 'overlay'
  }
});

export function create() {
  return new Drawer(true);
}
