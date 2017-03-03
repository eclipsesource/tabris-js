import NativeObject from './NativeObject';

export default class GC extends NativeObject {

  constructor(properties) {
    super();
    this._create('rwt.widgets.GC', properties);
    this._operations = [];
    this._opCodes = [];
    this._newOpCodes = [];
    this._doubles = [];
    this._booleans = [];
    this._strings = [];
    this._ints = [];
    let listener = () => this.flush();
    tabris.on('flush', listener);
    this.on('dispose', () => tabris.off('flush', listener));
  }

  init(properties) {
    this._nativeCall('init', properties);
  }

  getImageData(x, y, width, height) {
    let array = this._nativeCall('getImageData', {x, y, width, height});
    // TODO: remove when iOS returns a typed array
    return array instanceof Uint8ClampedArray ? array : new Uint8ClampedArray(array);
  }

  putImageData(imageData, x, y) {
    this._nativeCall('putImageData', {
      data: imageData.data,
      width: imageData.width,
      height: imageData.height,
      x,
      y
    });
  }

  addOperation(operation) {
    if (isIOS()) {
      this._operations.push([operation]);
    } else {
      if (this._opCodes.indexOf(operation) < 0) {
        this._newOpCodes.push(operation);
        this._opCodes.push(operation);
      }
      this._operations.push(this._opCodes.indexOf(operation));
    }
  }

  addBoolean() {
    let array = isIOS() ? this._operations[this._operations.length - 1] : this._booleans;
    Array.prototype.push.apply(array, arguments);
  }

  addDouble() {
    let array = isIOS() ? this._operations[this._operations.length - 1] : this._doubles;
    Array.prototype.push.apply(array, arguments);
  }

  addInt() {
    let array = isIOS() ? this._operations[this._operations.length - 1] : this._ints;
    Array.prototype.push.apply(array, arguments);
  }

  addString() {
    let array = isIOS() ? this._operations[this._operations.length - 1] : this._strings;
    Array.prototype.push.apply(array, arguments);
  }

  flush() {
    if (this._operations.length > 0) {
      if (isIOS()) {
        this._nativeCall('draw', {operations: this._operations});
      } else {
        this._nativeCall('draw', {packedOperations: [
          this._newOpCodes,
          this._operations,
          this._doubles,
          this._booleans,
          this._strings,
          this._ints
        ]});
      }
      this._newOpCodes = [];
      this._operations = [];
      this._doubles = [];
      this._booleans = [];
      this._strings = [];
      this._ints = [];
    }
  }

}

NativeObject.defineProperties(GC.prototype, {parent: 'proxy'});

function isIOS() {
  return tabris.device.platform === 'iOS';
}
