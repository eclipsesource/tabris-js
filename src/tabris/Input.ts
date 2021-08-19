import NativeObject from './NativeObject';

export default class Input extends NativeObject {

  get _nativeType() {
    return 'tabris.Input';
  }

  /** @override */
  _nativeCreate(param: any) {
    if (param !== true) {
      throw new Error('Input can not be created');
    }
    super._nativeCreate(null);
  }

  dispose() {
    throw new Error('Cannot dispose input object');
  }

}

NativeObject.defineEvents(Input.prototype, {
  pointerDown: {native: true},
  pointerMove: {native: true},
  pointerUp: {native: true},
  pointerCancel: {native: true},
  resize: {native: true}
});

export function create() {
  return new Input(true);
}
