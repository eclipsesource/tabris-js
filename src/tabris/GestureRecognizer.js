import NativeObject from './NativeObject';

export default class GestureRecognizer extends NativeObject {

  constructor(properties) {
    super();
    this._create('tabris.GestureRecognizer', properties);
  }

  _listen(name, listening) {
    if (name === 'gesture') {
      this._nativeListen(name, listening);
    } else {
      super._listen(name, listening);
    }
  }

}

NativeObject.defineProperties(GestureRecognizer.prototype, {
  type: 'string',
  target: 'NativeObject',
  fingers: 'natural',
  touches: 'natural',
  duration: 'natural',
  direction: 'string'
});
