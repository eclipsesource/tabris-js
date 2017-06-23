import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class Button extends Widget {

  get _nativeType() {
    return 'tabris.Button';
  }

  _listen(name, listening) {
    if (name === 'select') {
      this._nativeListen(name, listening);
    } else {
      super._listen(name, listening);
    }
  }

}

NativeObject.defineProperties(Button.prototype, {
  alignment: {type: ['choice', ['left', 'right', 'center']], default: 'center'},
  image: {type: 'image', default: null},
  text: {type: 'string', default: ''},
  textColor: {type: 'color'}
});
