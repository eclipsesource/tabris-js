import Widget from '../Widget';

export default function NavigationBar() {
  throw new Error('NavigationBar can not be created');
}

let _NavigationBar = Widget.extend({

  _name: 'NavigationBar',

  _type: 'tabris.NavigationBar',

  _supportsChildren: false,

  _setParent(parent, index) {
    if (this._parent) {
      throw new Error('Parent of NavigationBar can not be changed');
    }
    this._parent = parent;
    this._parent._addChild(this, index);
  },

  _properties: {
    displayMode: {type: ['choice', ['default', 'float', 'hide']], default: 'default'},
    height: {
      type: 'integer',
      nocache: true,
      access: {
        set() {
          throw new Error('NavigationBar "height" is read only');
        }
      }
    },
    background: {type: 'color', nocache: true}
  },

  _dispose() {
    throw new Error('NavigationBar can not be disposed');
  }

});

NavigationBar.prototype = _NavigationBar.prototype;

export function create() {
  return new _NavigationBar();
}
