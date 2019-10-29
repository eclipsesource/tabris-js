import NativeObject from './NativeObject';
import Camera from './Camera';

export default class Device extends NativeObject {

  get _nativeType() {
    return 'tabris.Device';
  }

  /** @override */
  _nativeCreate(param) {
    if (param !== true) {
      throw new Error('Device can not be created');
    }
    super._nativeCreate();
  }

  _listen(name, listening) {
    if (name === 'orientationChanged') {
      this._nativeListen(name, listening);
    } else {
      super._listen(name, listening);
    }
  }

  _trigger(name, event) {
    if (name === 'orientationChanged') {
      this._triggerChangeEvent('orientation', event.orientation);
    } else {
      super._trigger(name, event);
    }
  }

  dispose() {
    throw new Error('Cannot dispose device object');
  }

}

NativeObject.defineProperties(Device.prototype, {
  model: {readonly: true, const: true},
  vendor: {readonly: true, const: true},
  platform: {readonly: true, const: true},
  version: {readonly: true, const: true},
  name: {readonly: true, const: true},
  language: {readonly: true, const: true},
  orientation: {readonly: true, nocache: true},
  screenWidth: {readonly: true, const: true},
  screenHeight: {readonly: true, const: true},
  scaleFactor: {readonly: true, const: true},
  cameras: {
    type: {
      decode(value) {
        return Object.freeze(value.map((cameraId) => new Camera({cameraId})));
      }
    },
    readonly: true,
    const: true
  }
});

export function create() {
  return new Device(true);
}

export function publishDeviceProperties(device, target) {
  target.devicePixelRatio = device.scaleFactor;
  target.device = createDevice(device);
  target.screen = createScreen(device);
  target.navigator = createNavigator(device);
}

function createDevice(device) {
  const dev = {};
  ['model', 'vendor', 'platform', 'version', 'name'].forEach((name) => {
    defineReadOnlyProperty(dev, name, () => device[name]);
  });
  return dev;
}

function createScreen(device) {
  const screen = {};
  defineReadOnlyProperty(screen, 'width', () => device.screenWidth);
  defineReadOnlyProperty(screen, 'height', () => device.screenHeight);
  return screen;
}

function createNavigator(device) {
  const navigator = {};
  defineReadOnlyProperty(navigator, 'userAgent', () => 'tabris-js');
  defineReadOnlyProperty(navigator, 'language', () => device.language);
  return navigator;
}

function defineReadOnlyProperty(target, name, getter) {
  Object.defineProperty(target, name, {
    get: getter,
    set() {}
  });
}
