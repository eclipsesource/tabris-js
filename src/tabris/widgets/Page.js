import NativeObject from '../NativeObject';
import Composite from './Composite';
import NavigationView from '../widgets/NavigationView';
import {toValueString} from '../Console';

export default class Page extends Composite {

  get _nativeType() {
    return 'tabris.Page';
  }

  /** @returns {never} */
  insertBefore() {
    throw new Error('insertBefore not supported on Page');
  }

  /** @returns {never} */
  insertAfter() {
    throw new Error('insertAfter not supported on Page');
  }

  _setParent(parent, index) {
    if (parent && !(parent instanceof NavigationView)) {
      throw new Error(`Page could not be appended to ${toValueString(parent)}`);
    }
    super._setParent(parent, index);
  }

  _getXMLAttributes() {
    return super._getXMLAttributes().concat([['title', this.title]]);
  }

}

NativeObject.defineProperties(Page.prototype, {
  image: {type: 'ImageValue', default: null},
  title: {type: 'string', default: ''},
  autoDispose: {type: 'boolean', default: true}
});

NativeObject.defineEvents(Page.prototype, {
  appear: true,
  disappear: true
});
