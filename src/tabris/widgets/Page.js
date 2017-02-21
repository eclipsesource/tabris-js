import NativeObject from '../NativeObject';
import Widget from '../Widget';
import NavigationView from '../widgets/NavigationView';

export default class Page extends Widget {

  constructor(properties) {
    super();
    this._create('tabris.Page', properties);
  }

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

NativeObject.defineProperties(Page.prototype, {
  image: {type: 'image', default: null},
  title: {type: 'string', default: ''},
  autoDispose: {type: 'boolean', default: true}
});
