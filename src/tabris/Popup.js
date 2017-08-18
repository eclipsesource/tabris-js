import NativeObject from './NativeObject';

export default class Popup extends NativeObject {

  open() {
    if (this.isDisposed()) {
      throw new Error('Can not open a popup that was disposed');
    }
    this._nativeCall('open');
    return this;
  }

  close() {
    if (this._autoDispose) {
      this.dispose();
    }
    return this;
  }

}
