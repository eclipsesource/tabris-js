import Widget from '../Widget';

const CONFIG = {

  _name: 'NavigationBar',

  _type: 'tabris.NavigationBar',

  _properties: {
    displayMode: {type: ['choice', ['default', 'float', 'hide']], default: 'default'},
    height: {
      type: 'number',
      nocache: true,
      access: {
        set() {
          throw new Error('NavigationBar "height" is read only');
        }
      }
    },
    background: {type: 'color', nocache: true}
  }

};

export default class NavigationBar extends Widget.extend(CONFIG) {

  constructor() {
    super();
    if (arguments[0] !== true) {
      throw new Error('NavigationBar can not be created');
    }
  }

  _setParent(parent, index) {
    if (this._parent) {
      throw new Error('Parent of NavigationBar can not be changed');
    }
    super._setParent(parent, index);
  }

  _dispose() {
    throw new Error('NavigationBar can not be disposed');
  }

}

export function create() {
  return new NavigationBar(true);
}
