import Widget from '../Widget';
import TabFolder from './TabFolder';

const CONFIG = {
  _name: 'Tab',

  _type: 'tabris.Tab',

  _properties: {
    title: {type: 'string', default: ''},
    image: {type: 'image', default: null},
    selectedImage: {type: 'image', default: null},
    badge: {type: 'string', default: ''}
  }

};

export default class Tab extends Widget.extend(CONFIG) {

  _acceptChild() {
    return true;
  }

  _setParent(parent, index) {
    if (parent && !(parent instanceof TabFolder)) {
      throw new Error('Tab could not be appended to ' + parent);
    }
    super._setParent(parent, index);
  }

}
