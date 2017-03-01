import NativeObject from '../NativeObject';
import Widget from '../Widget';
import TabFolder from './TabFolder';

export default class Tab extends Widget {

  get _nativeType() {
    return 'tabris.Tab';
  }

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

NativeObject.defineProperties(Tab.prototype, {
  title: {type: 'string', default: ''},
  image: {type: 'image', default: null},
  selectedImage: {type: 'image', default: null},
  badge: {type: 'string', default: ''}
});
