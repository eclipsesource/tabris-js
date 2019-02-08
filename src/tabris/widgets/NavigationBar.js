import NativeObject from '../NativeObject';

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
  theme: {type: ['choice', ['default', 'light', 'dark']], default: 'default'},
  displayMode: {type: ['choice', ['default', 'float', 'hide']], default: 'default'},
  height: {
    type: 'number',
    readonly: true
  },
  background: {type: 'ColorValue', nocache: true}
});

export function create() {
  return new NavigationBar(true);
}
