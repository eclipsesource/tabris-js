import NativeObject from './NativeObject';

export default class Device extends NativeObject {

  constructor() {
    super('tabris.Device');
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
  model: {type: 'any', readonly: true},
  platform: {type: 'any', readonly: true},
  version: {type: 'any', readonly: true},
  language: {type: 'any', readonly: true},
  orientation: {type: 'any', readonly: true},
  screenWidth: {type: 'any', readonly: true},
  screenHeight: {type: 'any', readonly: true},
  scaleFactor: {type: 'any', readonly: true},
  win_keyboardPresent: {type: 'any', readonly: true},
  win_primaryInput: {type: 'any', readonly: true}
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
  ['model', 'platform', 'version'].forEach((name) => {
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
