import Composite from './Composite';

export default class ContentView extends Composite {

  /** @override */
  _nativeCreate(param) {
    if (param !== true) {
      throw new Error('ContentView can not be created');
    }
    super._nativeCreate();
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
