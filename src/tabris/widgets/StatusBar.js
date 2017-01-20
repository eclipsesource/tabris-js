import Widget from '../Widget';

const CONFIG = {

  _name: 'StatusBar',

  _type: 'tabris.StatusBar',

  _supportsChildren: false,

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
  }

};

export default class StatusBar extends Widget.extend(CONFIG) {

  constructor() {
    super();
    if (arguments[0] !== true) {
      throw new Error('StatusBar can not be created');
    }
  }

  _setParent(parent, index) {
    if (this._parent) {
      throw new Error('Parent of StatusBar can not be changed');
    }
    super._setParent(parent, index);
  }

  _dispose() {
    throw new Error('StatusBar can not be disposed');
  }

}

export function create() {
  return new StatusBar(true);
}
