import Widget from '../Widget';

export default Widget.extend({

  _name: 'Drawer',

  _type: 'tabris.Drawer',

  _supportsChildren: true,

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

  open() {
    this._nativeCall('open', {});
    return this;
  },

  close() {
    this._nativeCall('close', {});
    return this;
  }

});
