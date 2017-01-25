import NativeObject from './NativeObject';

const CONFIG = {
  _cid: 'tabris.Device',
  _properties: {
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
  },
  _events: {
    'change:orientation': {
      name: 'orientationchange',
      trigger(event) {
        this._triggerChangeEvent('orientation', event.orientation);
      }
    }
  }
};

export default class Device extends NativeObject.extend(CONFIG) {

  constructor() {
    super();
    if (arguments[0] !== true) {
      throw new Error('Device can not be created');
    }
  }

  _setProperty() {

  }

  dispose() {
    throw new Error('Cannot dispose device object');
  }

}

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
