import NativeObject from './NativeObject';

export default class DevTools extends NativeObject {

  get _nativeType() {
    return 'tabris.DevTools';
  }

  /** @override */
  _nativeCreate(param) {
    if (param !== true) {
      throw new Error('DevTools can not be created');
    }
    super._nativeCreate();
  }

  showUi() {
    return this._nativeCall('showUi');
  }

  hideUi() {
    this._nativeCall('hideUi');
  }

  isUiVisible() {
    return this._nativeCall('isUiVisible');
  }

  dispose() {
    throw new Error('Cannot dispose devTools object');
  }

}

export function create() {
  return new DevTools(true);
}
