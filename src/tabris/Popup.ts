import NativeObject from './NativeObject';
import JsxProcessor, {JSX} from './JsxProcessor';

export default class Popup extends NativeObject {

  open() {
    if (this.isDisposed()) {
      throw new Error('Can not open a popup that was disposed');
    }
    this._nativeCall('open', {});
    return this;
  }

  close() {
    this._handleClose({});
    return this;
  }

  _trigger(name: string, event: {}): boolean {
    if (name === 'close') {
      return this._handleClose(event);
    } else {
      return super._trigger(name, event);
    }
  }

  protected _handleClose(eventData: object) {
    if (this._isDisposed || this._inDispose) {
      return false;
    }
    super._trigger('close', eventData);
    this.dispose();
    return false;
  }

  protected [JSX.jsxFactory](this: JsxProcessor, Type: Constructor<Popup>, attributes: object) {
    return this.createNativeObject(Type, attributes);
  }

}
