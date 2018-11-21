import NativeObject from '../NativeObject';

export default class StatusBar extends NativeObject {

  constructor() {
    if (arguments[0] !== true) {
      throw new Error('StatusBar can not be created');
    }
    super();
    this._create('tabris.StatusBar');
  }

  get _nativeType() {
    return 'tabris.StatusBar';
  }

  _listen(name, listening) {
    if (name === 'tap') {
      this._nativeListen(name, listening);
    } else {
      super._listen(name, listening);
    }
  }

  _setParent() {
    throw new Error('Parent of StatusBar can not be changed');
  }

  _dispose() {
    throw new Error('StatusBar can not be disposed');
  }

}

NativeObject.defineProperties(StatusBar.prototype, {
  theme: {type: ['choice', ['default', 'light', 'dark']], default: 'default'},
  displayMode: {type: ['choice', ['default', 'float', 'hide']], default: 'default'},
  height: {
    type: 'number',
    readonly: true
  },
  background: {type: 'ColorValue', nocache: true}
});

NativeObject.defineEvents(StatusBar.prototype, {
  tap: true,
});

export function create() {
  return new StatusBar(true);
}
