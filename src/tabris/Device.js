import NativeObject from './NativeObject';

export default class Device extends NativeObject {

  constructor() {
    super();
    if (arguments[0] !== true) {
      throw new Error('Device can not be created');
    }
    this._create('tabris.Device');
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
  model: {readonly: true, get: getOnce},
  vendor: {readonly: true, get: getOnce},
  platform: {readonly: true, get: getOnce},
  version: {readonly: true, get: getOnce},
  name: {readonly: true},
  language: {readonly: true},
  orientation: {readonly: true},
  screenWidth: {readonly: true},
  screenHeight: {readonly: true},
  scaleFactor: {readonly: true, get: getOnce},
  win_keyboardPresent: {readonly: true},
  win_primaryInput: {readonly: true}
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
  let dev = {};
  ['model', 'vendor', 'platform', 'version', 'name'].forEach((name) => {
    defineReadOnlyProperty(dev, name, () => device[name]);
  });
  return dev;
}

function createScreen(device) {
  let screen = {};
  defineReadOnlyProperty(screen, 'width', () => device.screenWidth);
  defineReadOnlyProperty(screen, 'height', () => device.screenHeight);
  return screen;
}

function createNavigator(device) {
  let navigator = {};
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

function getOnce(name) {
  let value = this._getStoredProperty(name);
  if (!value) {
    value = this._nativeGet(name);
    this._storeProperty(name, value);
  }
  return value;
}
