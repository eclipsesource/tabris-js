import Widget from '../Widget';

const CONFIG = {

  _name: 'ContentView',

  _type: 'tabris.Composite'

};

export default class ContentView extends Widget.extend(CONFIG) {

  constructor() {
    super();
    if (arguments[0] !== true) {
      throw new Error('ContentView can not be created');
    }
  }

  _create() {
    Widget.prototype._create.call(this, {});
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
