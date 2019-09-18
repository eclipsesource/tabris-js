import NativeObject from '../NativeObject';
import {types} from '../property-types';

export default class NavigationBar extends NativeObject {

  get _nativeType() {
    return 'tabris.NavigationBar';
  }

  /** @override */
  _nativeCreate(param) {
    if (param !== true) {
      throw new Error('NavigationBar can not be created');
    }
    super._nativeCreate();
  }

  _setParent() {
    throw new Error('Parent of NavigationBar can not be changed');
  }

  _dispose() {
    throw new Error('NavigationBar can not be disposed');
  }

}

NativeObject.defineProperties(NavigationBar.prototype, {
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
  background: {
    type: types.ColorValue,
    nocache: true
  }
});

export function create() {
  return new NavigationBar(true);
}
