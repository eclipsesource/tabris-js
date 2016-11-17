import Widget from '../Widget';

export default function Drawer() {
  throw new Error('Drawer can not be created');
}

let _Drawer = Widget.extend({

  _name: 'Drawer',

  _type: 'tabris.Drawer',

  _supportsChildren: true,

  _setParent(parent, index) {
    if (this._parent) {
      throw new Error('Parent of Drawer can not be changed');
    }
    this._parent = parent;
    this._parent._addChild(this, index);
  },

  _properties: {
    win_displayMode: {
      type: ['choice', ['overlay', 'compactOverlay']],
      default: 'overlay'
    },
    win_buttonBackground: {
      type: 'color',
      default: null
    },
    win_buttonTheme: {
      type: ['choice', ['light', 'dark', 'default']],
      default: 'default'
    },
    enabled: {
      type: 'boolean',
      default: false
    }
  },

  _events: {
    open: {
      trigger() {
        this.trigger('open', this);
      }
    },
    close: {
      trigger() {
        this.trigger('close', this);
      }
    }
  },

  _dispose() {
    throw new Error('Drawer can not be disposed');
  },

  open() {
    this._nativeCall('open', {});
    return this;
  },

  close() {
    this._nativeCall('close', {});
    return this;
  }

});

Drawer.prototype = _Drawer.prototype;

export function create() {
  return new _Drawer();
}
