import NativeObject from './NativeObject';

var _Device = NativeObject.extend({
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
  _setProperty: function() {},
  _events: {
    'change:orientation': {
      name: 'orientationchange',
      trigger: function(event) {
        this._triggerChangeEvent('orientation', event.orientation);
      }
    }
  },
  dispose: function() {
    throw new Error('Cannot dispose device object');
  }
});

export default function Device() {
  throw new Error('Device can not be created');
}

Device.prototype = _Device.prototype;

export function create() {
  return new _Device();
}

export function publishDeviceProperties(device, target) {
  target.devicePixelRatio = device.scaleFactor;
  target.device = createDevice(device);
  target.screen = createScreen(device);
  target.navigator = createNavigator(device);
}

function createDevice(device) {
  var dev = {};
  ['model', 'platform', 'version'].forEach(function(name) {
    defineReadOnlyProperty(dev, name, function() {return device[name];});
  });
  return dev;
}

function createScreen(device) {
  var screen = {};
  defineReadOnlyProperty(screen, 'width', function() {return device.screenWidth;});
  defineReadOnlyProperty(screen, 'height', function() {return device.screenHeight;});
  return screen;
}

function createNavigator(device) {
  var navigator = {};
  defineReadOnlyProperty(navigator, 'userAgent', function() {return 'tabris-js';});
  defineReadOnlyProperty(navigator, 'language', function() {return device.language;});
  return navigator;
}

function defineReadOnlyProperty(target, name, getter) {
  Object.defineProperty(target, name, {
    get: getter,
    set: function() {}
  });
}
