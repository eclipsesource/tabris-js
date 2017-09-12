import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class NavigationBar extends Widget {

  constructor() {
    if (arguments[0] !== true) {
      throw new Error('NavigationBar can not be created');
    }
    super();
  }

  get _nativeType() {
    return 'tabris.NavigationBar';
  }

  _setParent(parent, index) {
    if (this._parent) {
      throw new Error('Parent of NavigationBar can not be changed');
    }
    super._setParent(parent, index);
  }

  _dispose() {
    throw new Error('NavigationBar can not be disposed');
  }

}

NativeObject.defineProperties(NavigationBar.prototype, {
  displayMode: {type: ['choice', ['default', 'float', 'hide']], default: 'default'},
  height: {
    type: 'number',
    readonly: true
  },
  background: {type: 'color', nocache: true}
});

export function create() {
  return new NavigationBar(true);
}
