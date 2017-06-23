import Composite from './Composite';

export default class ContentView extends Composite {

  constructor() {
    if (arguments[0] !== true) {
      throw new Error('ContentView can not be created');
    }
    super();
  }

  _create(type, properties) {
    super._create(type, properties);
    this._nativeSet('root', true);
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
