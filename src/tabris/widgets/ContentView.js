import Widget from '../Widget';

export default function ContentView() {
  throw new Error('ContentView can not be created');
}
let _ContentView = Widget.extend({

  _name: 'ContentView',

  _type: 'tabris.Composite',

  _supportsChildren: true,

  _create() {
    Widget.prototype._create.call(this, {});
    this._nativeSet('root', true);
  },

  _setParent(parent, index) {
    if (this._parent) {
      throw new Error('Parent of ContentView can not be changed');
    }
    this._parent = parent;
    this._parent._addChild(this, index);
  },

  _dispose() {
    throw new Error('ContentView can not be disposed');
  }

});

ContentView.prototype = _ContentView.prototype;

export function create() {
  return new _ContentView();
}
