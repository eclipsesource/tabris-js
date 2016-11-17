import Widget from '../Widget';

export default function StatusBar() {
  throw new Error('StatusBar can not be created');
}

let _StatusBar = Widget.extend({

  _name: 'StatusBar',

  _type: 'tabris.StatusBar',

  _supportsChildren: false,

  _setParent() {
    if (this._parent) {
      throw new Error('Parent of StatusBar can not be changed');
    }
    this._super('_setParent', arguments);
  },

  _properties: {
    theme: {type: ['choice', ['default', 'light', 'dark']], default: 'default'},
    displayMode: {type: ['choice', ['default', 'float', 'hide']], default: 'default'},
    height: {
      type: 'integer',
      nocache: true,
      access: {
        set() {
          throw new Error('StatusBar "height" is read only');
        }
      }
    },
    background: {type: 'color', nocache: true}
  },

  _dispose() {
    throw new Error('StatusBar can not be disposed');
  }

});

StatusBar.prototype = _StatusBar.prototype;

export function create() {
  return new _StatusBar();
}
