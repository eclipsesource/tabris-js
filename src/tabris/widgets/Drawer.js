import Widget from '../Widget';

const CONFIG = {

  _name: 'Drawer',

  _type: 'tabris.Drawer',

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

};

export default class Drawer extends Widget.extend(CONFIG) {

  constructor() {
    super();
    if (arguments[0] !== true) {
      throw new Error('Drawer can not be created');
    }
  }

  _acceptChild() {
    return true;
  }

  _setParent(parent, index) {
    if (this._parent) {
      throw new Error('Parent of Drawer can not be changed');
    }
    super._setParent(parent, index);
  }

  _dispose() {
    throw new Error('Drawer can not be disposed');
  }

  open() {
    this._nativeCall('open', {});
    return this;
  }

  close() {
    this._nativeCall('close', {});
    return this;
  }

}

export function create() {
  return new Drawer(true);
}
