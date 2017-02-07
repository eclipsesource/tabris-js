import Widget from '../Widget';
import NavigationView from '../widgets/NavigationView';

const CONFIG = {
  _name: 'Page',
  _type: 'tabris.Page',
  _properties: {
    image: {type: 'image', default: null},
    title: {type: 'string', default: ''},
    autoDispose: {type: 'boolean', default: true}
  }
};

export default class Page extends Widget.extend(CONFIG) {

  insertBefore() {
    throw new Error('insertBefore not supported on Page');
  }

  insertAfter() {
    throw new Error('insertAfter not supported on Page');
  }

  _acceptChild() {
    return true;
  }

  _setParent(parent, index) {
    if (parent && !(parent instanceof NavigationView)) {
      throw new Error('Page could not be appended to ' + parent);
    }
    super._setParent(parent, index);
  }

}
