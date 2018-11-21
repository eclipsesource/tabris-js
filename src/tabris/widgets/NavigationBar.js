import NativeObject from '../NativeObject';

export default class NavigationBar extends NativeObject {

  constructor() {
    if (arguments[0] !== true) {
      throw new Error('NavigationBar can not be created');
    }
    super();
    this._create('tabris.NavigationBar');
  }

  get _nativeType() {
    return 'tabris.NavigationBar';
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
