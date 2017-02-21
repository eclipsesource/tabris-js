import Widget from '../Widget';

export default class ContentView extends Widget {

  constructor(properties) {
    super();
    if (arguments[0] !== true) {
      throw new Error('ContentView can not be created');
    }
    this._create('tabris.Composite', properties);
  }

  _create(type, properties) {
    super._create(type, properties);
    this._nativeSet('root', true);
  }

  _acceptChild() {
    return true;
  }

  _setParent(parent, index) {
    if (this._parent) {
      throw new Error('Parent of ContentView can not be changed');
    }
    super._setParent(parent, index);
  }

  _dispose() {
    throw new Error('ContentView can not be disposed');
  }

}

export function create() {
  return new ContentView(true);
}
