import NativeObject from '../NativeObject';
import Composite from './Composite';
import TabFolder from './TabFolder';

export default class Tab extends Composite {

  get _nativeType() {
    return 'tabris.Tab';
  }

  _setParent(parent, index) {
    if (parent && !(parent instanceof TabFolder)) {
      throw new Error('Tab could not be appended to ' + parent);
    }
    super._setParent(parent, index);
  }

  _getXMLAttributes() {
    return super._getXMLAttributes().concat([['title', this.title]]);
  }

}

NativeObject.defineProperties(Tab.prototype, {
  title: {type: 'string', default: ''},
  image: {type: 'ImageValue', default: null},
  selectedImage: {type: 'ImageValue', default: null},
  badge: {type: 'natural', default: 0},
  badgeColor: {type: 'ColorValue'}
});

NativeObject.defineEvents(Tab.prototype, {
  disappear: true,
  appear: true
});
