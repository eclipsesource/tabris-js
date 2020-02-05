import NativeObject from '../NativeObject';
import {types} from '../property-types';

export default class StatusBar extends NativeObject {

  get _nativeType() {
    return 'tabris.StatusBar';
  }

  /** @override */
  _nativeCreate(param) {
    if (param !== true) {
      throw new Error('StatusBar can not be created');
    }
    super._nativeCreate();
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
  theme: {
    type: types.string,
    choice: ['default', 'light', 'dark'],
    default: 'default'
  },
  displayMode: {
    type: types.string,
    choice: ['default', 'float', 'hide'],
    default: 'default'
  },
  height: {
    type: types.number,
    readonly: true,
    nocache: true
  },
  background: {type: types.ColorValue, nocache: true}
});

NativeObject.defineEvents(StatusBar.prototype, {
  tap: true
});

export function create() {
  return new StatusBar(true);
}
