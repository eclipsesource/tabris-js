import Widget from '../Widget';
import NavigationView from '../widgets/NavigationView';

const CONFIG = {

  _name: 'Page',

  _type: 'tabris.Page',

  _supportsChildren: true,

  _properties: {
    image: {type: 'image', default: null},
    title: {type: 'string', default: ''},
    topLevel: {type: 'boolean', default: false},
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

  _setParent(parent) {
    if (parent && !(parent instanceof NavigationView)) {
      throw new Error('Page cannot be appended to parent of type ' + parent.type);
    }
    Widget.prototype._setParent.apply(this, arguments);
  }

}
