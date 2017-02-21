import NativeObject from './NativeObject';

export default class Device extends NativeObject {

  constructor() {
    super('tabris.Device');
    if (arguments[0] !== true) {
      throw new Error('Device can not be created');
    }
  }

  _setProperty() {
    // prevent overwriting properties
  }

  _listen(name, listening) {
    if (name === 'change:orientation') {
      this._nativeListen('orientationchange', listening);
    } else {
      super._listen(name, listening);
    }
  }

  _trigger(name, event) {
    if (name === 'orientationchange') {
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
  model: 'any',
  platform: 'any',
  version: 'any',
  language: 'any',
  orientation: 'any',
  screenWidth: 'any',
  screenHeight: 'any',
  scaleFactor: 'any',
  win_keyboardPresent: 'any',
  win_primaryInput: 'any'
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
