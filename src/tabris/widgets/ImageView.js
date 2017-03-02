import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class ImageView extends Widget {

  get _nativeType() {
    return 'tabris.ImageView';
  }

  _listen(name, listening) {
    if (name === 'load') {
      this._nativeListen(name, listening);
    } else {
      super._listen(name, listening);
    }
  }

}

NativeObject.defineProperties(ImageView.prototype, {
  image: {type: 'image', default: null},
  scaleMode: {type: ['choice', ['auto', 'fit', 'fill', 'stretch', 'none']], default: 'auto'},
  tintColor: {
    type: 'color',
    set(name, value) {
      this._nativeSet(name, value === undefined ? null : value);
      this._storeProperty(name, value);
    }
  }
});
