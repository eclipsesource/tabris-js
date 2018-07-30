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

}

NativeObject.defineProperties(Tab.prototype, {
  title: {type: 'string', default: ''},
  image: {type: 'image', default: null},
  selectedImage: {type: 'image', default: null},
  badge: {type: 'string', default: ''}
});

NativeObject.defineEvents(Tab.prototype, {
  disappear: true,
  appear: true
});
