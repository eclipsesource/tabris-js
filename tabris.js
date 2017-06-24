(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.tabris = factory());
}(this, (function () { 'use strict';

/**
 * Implementation based on https://github.com/then/promise
 *
 * Original work Copyright (c) 2014 Forbes Lindesay
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

function asap(fn) {
  setTimeout(fn, 0);
}

// --- core.js ---

function noop() {}

// States:
//
// 0 - pending
// 1 - fulfilled with _value
// 2 - rejected with _value
// 3 - adopted the state of another promise, _value
//
// once the state is no longer pending (0) it is immutable

// to avoid using try/catch inside critical functions, we
// extract them to here.
var LAST_ERROR = null;
var IS_ERROR = {};

function getThen(obj) {
  try {
    return obj.then;
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

function tryCallOne(fn, a) {
  try {
    return fn(a);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

function tryCallTwo(fn, a, b) {
  try {
    fn(a, b);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

function Promise$1(fn) {
  if (typeof this !== 'object') {
    throw new TypeError('Promises must be constructed via new');
  }
  if (typeof fn !== 'function') {
    throw new TypeError('not a function');
  }
  this._deferredState = 0;
  this._state = 0;
  this._value = null;
  this._deferreds = null;
  if (fn === noop) {return;}
  doResolve(fn, this);
}
Promise$1._onHandle = null;
Promise$1._onReject = null;
Promise$1._noop = noop;

Promise$1.prototype.then = function(onFulfilled, onRejected) {
  if (this.constructor !== Promise$1) {
    return safeThen(this, onFulfilled, onRejected);
  }
  var res = new Promise$1(noop);
  handle(this, new Handler(onFulfilled, onRejected, res));
  return res;
};

function safeThen(self, onFulfilled, onRejected) {
  return new self.constructor(function (resolve, reject) {
    var res = new Promise$1(noop);
    res.then(resolve, reject);
    handle(self, new Handler(onFulfilled, onRejected, res));
  });
}

function handle(self, deferred) {
  while (self._state === 3) {
    self = self._value;
  }
  if (Promise$1._onHandle) {
    Promise$1._onHandle(self);
  }
  if (self._state === 0) {
    if (self._deferredState === 0) {
      self._deferredState = 1;
      self._deferreds = deferred;
      return;
    }
    if (self._deferredState === 1) {
      self._deferredState = 2;
      self._deferreds = [self._deferreds, deferred];
      return;
    }
    self._deferreds.push(deferred);
    return;
  }
  handleResolved(self, deferred);
}

function handleResolved(self, deferred) {
  asap(function () {
    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      if (self._state === 1) {
        resolve(deferred.promise, self._value);
      } else {
        reject(deferred.promise, self._value);
      }
      return;
    }
    var ret = tryCallOne(cb, self._value);
    if (ret === IS_ERROR) {
      reject(deferred.promise, LAST_ERROR);
    } else {
      resolve(deferred.promise, ret);
    }
  });
}

function resolve(self, newValue) {
  // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
  if (newValue === self) {
    return reject(
      self,
      new TypeError('A promise cannot be resolved with itself.')
    );
  }
  if (
    newValue &&
    (typeof newValue === 'object' || typeof newValue === 'function')
  ) {
    var then = getThen(newValue);
    if (then === IS_ERROR) {
      return reject(self, LAST_ERROR);
    }
    if (
      then === self.then &&
      newValue instanceof Promise$1
    ) {
      self._state = 3;
      self._value = newValue;
      finale(self);
      return;
    } else if (typeof then === 'function') {
      doResolve(then.bind(newValue), self);
      return;
    }
  }
  self._state = 1;
  self._value = newValue;
  finale(self);
}

function reject(self, newValue) {
  self._state = 2;
  self._value = newValue;
  if (Promise$1._onReject) {
    Promise$1._onReject(self, newValue);
  }
  finale(self);
}

function finale(self) {
  if (self._deferredState === 1) {
    handle(self, self._deferreds);
    self._deferreds = null;
  }
  if (self._deferredState === 2) {
    for (var i = 0; i < self._deferreds.length; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }
}

function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, promise) {
  var done = false;
  var res = tryCallTwo(fn, function (value) {
    if (done) {return;}
    done = true;
    resolve(promise, value);
  }, function (reason) {
    if (done) {return;}
    done = true;
    reject(promise, reason);
  });
  if (!done && res === IS_ERROR) {
    done = true;
    reject(promise, LAST_ERROR);
  }
}

// --- es6-extensions.js ---

//This file contains the ES6 extensions to the core Promises/A+ API

/* Static Functions */

var TRUE = valuePromise(true);
var FALSE = valuePromise(false);
var NULL = valuePromise(null);
var UNDEFINED = valuePromise(undefined);
var ZERO = valuePromise(0);
var EMPTYSTRING = valuePromise('');

function valuePromise(value) {
  var p = new Promise$1(Promise$1._noop);
  p._state = 1;
  p._value = value;
  return p;
}
Promise$1.resolve = function(value) {
  if (value instanceof Promise$1) {return value;}

  if (value === null) {return NULL;}
  if (value === undefined) {return UNDEFINED;}
  if (value === true) {return TRUE;}
  if (value === false) {return FALSE;}
  if (value === 0) {return ZERO;}
  if (value === '') {return EMPTYSTRING;}

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then;
      if (typeof then === 'function') {
        return new Promise$1(then.bind(value));
      }
    } catch (ex) {
      return new Promise$1(function (resolve, reject) { return reject(ex); });
    }
  }
  return valuePromise(value);
};

Promise$1.all = function(arr) {
  var args = Array.prototype.slice.call(arr);
  return new Promise$1(function (resolve, reject) {
    if (args.length === 0) {return resolve([]);}
    var remaining = args.length;
    function res(i, val) {
      if (val && (typeof val === 'object' || typeof val === 'function')) {
        if (val instanceof Promise$1 && val.then === Promise$1.prototype.then) {
          while (val._state === 3) {
            val = val._value;
          }
          if (val._state === 1) {return res(i, val._value);}
          if (val._state === 2) {reject(val._value);}
          val.then(function (val) { return res(i, val); }, reject);
          return;
        } else {
          var then = val.then;
          if (typeof then === 'function') {
            var p = new Promise$1(then.bind(val));
            p.then(function (val) { return res(i, val); }, reject);
            return;
          }
        }
      }
      args[i] = val;
      if (--remaining === 0) {
        resolve(args);
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise$1.reject = function(value) {
  return new Promise$1(function (resolve, reject) { return reject(value); });
};

Promise$1.race = function(values) {
  return new Promise$1(function (resolve, reject) { return values.forEach(function (value) { return Promise$1.resolve(value).then(resolve, reject); }); });
};

/* Prototype Methods */

Promise$1.prototype.catch = function(onRejected) {
  return this.then(null, onRejected);
};

global.Promise = Promise$1;

if (typeof window === 'undefined') {
  global.window = global;
}

if (!Object.assign) {
  Object.defineProperty(Object, 'assign', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: assign
  });
}

/**
 * Original code from
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 */
function assign(target) {
  var arguments$1 = arguments;

  if (target === undefined || target === null) {
    throw new TypeError('Cannot convert first argument to object');
  }
  var to = Object(target);
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments$1[i];
    if (source === undefined || source === null) {
      continue;
    }
    var keys = Object.keys(Object(source));
    for (var i$1 = 0, list = keys; i$1 < list.length; i$1 += 1) {
      var key = list[i$1];

      var desc = Object.getOwnPropertyDescriptor(source, key);
      if (desc !== undefined && desc.enumerable) {
        to[key] = source[key];
      }
    }
  }
  return to;
}

function checkVersion(tabrisVersionString, clientVersionString) {
  if (!clientVersionString) {
    return;
  }
  var tabrisVersion = tabrisVersionString.split('.').map(toInt);
  var clientVersion = clientVersionString.split('.').map(toInt);
  if (tabrisVersion[0] !== clientVersion[0]) {
    console.error(createVersionMessage(clientVersion, tabrisVersion, 'incompatible with'));
  } else if (tabrisVersion[1] > clientVersion[1]) {
    console.warn(createVersionMessage(clientVersion, tabrisVersion, 'newer than'));
  }
}

function toInt(string) {
  return parseInt(string);
}

function createVersionMessage(clientVersion, tabrisVersion, versionComp) {
  var from = clientVersion[0] + '.0';
  var to = clientVersion[0] + '.' + clientVersion[1];
  return "Version mismatch: JavaScript module \"tabris\" (version " + (tabrisVersion.join('.')) + ") " +
         "is " + versionComp + " the native tabris platform. " +
         "Supported module versions: " + from + " to " + to + ".";
}

function omit(object, keys) {
  var result = {};
  for (var key in object) {
    if (!keys.includes(key)) {
      result[key] = object[key];
    }
  }
  return result;
}

function isObject(value) {
  return value !== null && typeof value === 'object';
}

function capitalizeFirstChar(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

var Events = {

  on: function on(type, callback, context) {
    var this$1 = this;

    if (isObject(type)) {
      for (var key in type) {
        this$1.on(key, type[key]);
      }
      return this;
    }
    var wasListening = this._isListening(type);
    this._callbacks = this._callbacks || [];
    this._callbacks[type] = (this._callbacks[type] || []).concat();
    var alreadyAdded = this._callbacks[type].some(function (entry) { return (
      (entry.fn === callback || '_callback' in callback && entry.fn._callback === callback._callback) &&
      (entry.ctx === context)
    ); });
    if (!alreadyAdded) {
      this._callbacks[type].push({fn: callback, ctx: context});
    }
    if (!wasListening) {
      this._listen(type, true);
    }
    return this;
  },

  off: function off(type, callback, context) {
    var this$1 = this;

    if (isObject(type)) {
      for (var key in type) {
        this$1.off(key, type[key]);
      }
      return this;
    }
    if (!type || !callback) {
      throw new Error('Not enough arguments');
    }
    if (this._callbacks) {
      if (type in this._callbacks) {
        var callbacks = this._callbacks[type].concat();
        for (var i = callbacks.length - 1; i >= 0; i--) {
          if ((callbacks[i].fn === callback || callbacks[i].fn._callback === callback) &&
            callbacks[i].ctx === context) {
            callbacks.splice(i, 1);
          }
        }
        if (callbacks.length === 0) {
          delete this._callbacks[type];
          if (Object.keys(this._callbacks).length === 0) {
            delete this._callbacks;
          }
        } else {
          this._callbacks[type] = callbacks;
        }
      }
    }
    if (!this._isListening(type)) {
      this._listen(type, false);
    }
    return this;
  },

  once: function once(type, callback, context) {
    var this$1 = this;

    if (isObject(type)) {
      for (var key in type) {
        this$1.once(key, type[key]);
      }
      return this;
    }
    var self = this;
    var wrappedCallback = function() {
      if (!self._isDisposed) {
        self.off(type, wrappedCallback, context);
      }
      callback.apply(this, arguments);
    };
    wrappedCallback._callback = callback;
    return this.on(type, wrappedCallback, context);
  },

  trigger: function trigger(type, event) {
    var this$1 = this;
    if ( event === void 0 ) event = {};

    if (!this._isDisposed) {
      if (this._callbacks && type in this._callbacks) {
        var callbacks = this._callbacks[type];
        for (var i = 0; i < callbacks.length; i++) {
          var callback = callbacks[i];
          callback.fn.call(callback.ctx || this$1, event);
        }
      }
    }
    return this;
  },

  _isListening: function _isListening(type) {
    return !!this._callbacks && (!type || type in this._callbacks);
  },

  _listen: function _listen() {}

};

function imageToArray(value) {
  return [value.src, checkValue(value.width), checkValue(value.height), checkValue(value.scale)];
}

function imageFromArray(value) {
  var result = {src: value[0]};
  if (value[1]) {
    result.width = value[1];
  }
  if (value[2]) {
    result.height = value[2];
  }
  if (value[3]) {
    result.scale = value[3];
  }
  return result;
}

function checkValue(value) {
  return value != null ? value : null;
}

function colorArrayToString(array) {
  var r = array[0];
  var g = array[1];
  var b = array[2];
  var a = array.length === 3 ? 1 : Math.round(array[3] * 100 / 255) / 100;
  return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
}

function colorStringToArray(str) {
  if (str === 'transparent') {
    return [0, 0, 0, 0];
  }
  // #xxxxxx and #xxxxxxxx
  if (/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?$/.test(str)) {
    return [
      parseInt(RegExp.$1, 16),
      parseInt(RegExp.$2, 16),
      parseInt(RegExp.$3, 16),
      RegExp.$4 === '' ? 255 : parseInt(RegExp.$4, 16)
    ];
  }
  // #xxx and #xxxx
  if (/^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])?$/.test(str)) {
    return [
      parseInt(RegExp.$1, 16) * 17,
      parseInt(RegExp.$2, 16) * 17,
      parseInt(RegExp.$3, 16) * 17,
      RegExp.$4 === '' ? 255 : parseInt(RegExp.$4, 16) * 17
    ];
  }
  // #rgb(r, g, b)
  if (/^rgb\s*\(\s*([+\-]?[0-9]+)\s*,\s*([+\-]?[0-9]+)\s*,\s*([+\-]?[0-9]+)\s*\)$/.test(str)) {
    return [
      Math.max(0, Math.min(255, parseInt(RegExp.$1))),
      Math.max(0, Math.min(255, parseInt(RegExp.$2))),
      Math.max(0, Math.min(255, parseInt(RegExp.$3))),
      255
    ];
  }
  // rgba(r, g, b, a)
  if (/^rgba\s*\(\s*([+\-]?[0-9]+)\s*,\s*([+\-]?[0-9]+)\s*,\s*([+\-]?[0-9]+)\s*,\s*([+\-]?([0-9]*\.)?[0-9]+)\s*\)$/.test(str)) {
    return [
      Math.max(0, Math.min(255, parseInt(RegExp.$1))),
      Math.max(0, Math.min(255, parseInt(RegExp.$2))),
      Math.max(0, Math.min(255, parseInt(RegExp.$3))),
      Math.round(Math.max(0, Math.min(1, parseFloat(RegExp.$4))) * 255)
    ];
  }
  // named colors
  if (str in NAMES) {
    var rgb = NAMES[str];
    return [rgb[0], rgb[1], rgb[2], 255];
  }
  throw new Error('invalid color: ' + str);
}

/*
 * Basic color keywords as defined in CSS 3
 * See http://www.w3.org/TR/css3-color/#html4
 */
var NAMES = {
  black: [0, 0, 0],
  silver: [192, 192, 192],
  gray: [128, 128, 128],
  white: [255, 255, 255],
  maroon: [128, 0, 0],
  red: [255, 0, 0],
  purple: [128, 0, 128],
  fuchsia: [255, 0, 255],
  green: [0, 128, 0],
  lime: [0, 255, 0],
  olive: [128, 128, 0],
  yellow: [255, 255, 0],
  navy: [0, 0, 128],
  blue: [0, 0, 255],
  teal: [0, 128, 128],
  aqua: [0, 255, 255]
};

function fontStringToObject(str) {
  var result = {family: [], size: 0, style: 'normal', weight: 'normal'};
  var parts = str.split(/(?:\s|^)\d+px(?:\s|$)/);
  checkTruthy(parts.length === 2 || parts.length === 1, 'Invalid font syntax');
  result.size = parseInt(/(?:\s|^)(\d+)px(?:\s|$)/.exec(str)[1], 10);
  parseStyles(result, parts[0]);
  parseFamily(result, parts[1]);
  return result;
}

function fontObjectToString(font) {
  return [font.style, font.weight, font.size + 'px', font.family.join(', ')].join(' ').trim();
}

function parseStyles(fontArr, styles) {
  var styleArr = styles.trim().split(/\s+/);
  checkTruthy(styleArr.length <= 2, 'Too many font styles');
  styleArr.forEach(function (property) {
    switch (property.trim()) {
      case 'italic':
        checkTruthy(fontArr.style === 'normal', 'Invalid font variant');
        fontArr.style = 'italic';
        break;
      case 'black':
      case 'bold':
      case 'medium':
      case 'thin':
      case 'light':
        checkTruthy(fontArr.weight === 'normal', 'Invalid font weight');
        fontArr.weight = property.trim();
        break;
      case 'normal':
      case '':
        break;
      default:
        throw new Error('Unknown font property: ' + property.trim());
    }
  });
}

function parseFamily(fontArr, family) {
  // NOTE: Currently family is optional to allow for default fonts, but this is
  //       not CSS font syntax. See https://github.com/eclipsesource/tabris-js/issues/24
  (family ? family.split(',') : []).forEach(function (name) {
    var valid = /(?:^\s*[^\"\']+\s*$)|(?:^\s*\"[^\"\']+\"\s*$)|(?:^\s*\'[^\"\']+\'\s*$)/.exec(name);
    checkTruthy(valid, 'Invalid font family: ' + name);
    fontArr.family.push(/^\s*[\"\']?([^\"\']*)/.exec(name)[1].trim());
  });
}

function checkTruthy(value, message) {
  if (!value) {
    throw new Error(message);
  }
}

var EventObject = function EventObject(type, target, data) {
  var this$1 = this;
  if ( data === void 0 ) data = {};

  if (arguments.length < 2) {
    throw new Error('Not enough arguments to Event');
  }
  Object.defineProperties(this, {
    type: {enumerable: true, value: type},
    target: {enumerable: true, value: target},
    timeStamp: {enumerable: true, value: Date.now()}
  });
  for (var key in data) {
    if (!(key in this$1)) {
      Object.defineProperty(this$1, key, {enumerable: true, value: data[key]});
    }
  }
};

var prototypeAccessors$1 = { defaultPrevented: {} };

prototypeAccessors$1.defaultPrevented.get = function () {
  return !!this.$defaultPrevented;
};

EventObject.prototype.preventDefault = function preventDefault () {
  this.$defaultPrevented = true;
};

Object.defineProperties( EventObject.prototype, prototypeAccessors$1 );

function EventsClass() {}
Object.assign(EventsClass.prototype, Events);

var NativeObject = (function (EventsClass) {
  function NativeObject(cid) {
    EventsClass.call(this);
    if (!tabris._nativeBridge) {
      throw new Error('tabris.js not started');
    }
    if (this.constructor === NativeObject) {
      throw new Error('Cannot instantiate abstract NativeObject');
    }
    cid = tabris._proxies.register(this, cid);
    Object.defineProperty(this, 'cid', {value: cid});
  }

  if ( EventsClass ) NativeObject.__proto__ = EventsClass;
  NativeObject.prototype = Object.create( EventsClass && EventsClass.prototype );
  NativeObject.prototype.constructor = NativeObject;

  NativeObject.defineProperties = function defineProperties (target, definitions) {
    for (var name in definitions) {
      NativeObject.defineProperty(target, name, definitions[name]);
    }
  };

  NativeObject.defineProperty = function defineProperty (target, name, definition) {
    target['$prop_' + name] = normalizeProperty(definition);
    Object.defineProperty(target, name, {
      set: function set(value) {
        this.$setProperty(name, value);
      },
      get: function get() {
        return this.$getProperty(name);
      }
    });
  };

  NativeObject.extend = function extend (nativeType, superType) {
    if ( superType === void 0 ) superType = NativeObject;

    return (function (superType) {
      function anonymous(properties) {
        superType.call(this);
        this._create(nativeType, properties || {});
      }

      if ( superType ) anonymous.__proto__ = superType;
      anonymous.prototype = Object.create( superType && superType.prototype );
      anonymous.prototype.constructor = anonymous;

      return anonymous;
    }(superType));
  };

  NativeObject.prototype.set = function set (arg1, arg2) {
    if (typeof arg1 === 'string') {
      setExistingProperty.call(this, arg1, arg2);
    } else {
      this._reorderProperties(Object.keys(arg1)).forEach(function(name) {
        setExistingProperty.call(this, name, arg1[name]);
      }, this);
    }
    return this;
  };

  NativeObject.prototype.get = function get (name) {
    return this[name];
  };

  NativeObject.prototype.$getProperty = function $getProperty (name) {
    if (this._isDisposed) {
      console.warn('Cannot get property "' + name + '" on disposed object');
      return;
    }
    var getter = this.$getPropertyGetter(name) || this._getStoredProperty;
    var value = getter.call(this, name);
    return this._decodeProperty(this._getTypeDef(name), value);
  };

  NativeObject.prototype.$setProperty = function $setProperty (name, value) {
    if (this._isDisposed) {
      console.warn('Cannot set property "' + name + '" on disposed object');
      return;
    }
    var typeDef = this._getTypeDef(name);
    var encodedValue;
    try {
      encodedValue = this._encodeProperty(typeDef, value);
    } catch (ex) {
      console.warn(this + ': Ignored unsupported value for property "' + name + '": ' + ex.message);
      return;
    }
    var setter = this.$getPropertySetter(name) || this._storeProperty;
    setter.call(this, name, encodedValue);
  };

  NativeObject.prototype._storeProperty = function _storeProperty (name, encodedValue) {
    var oldEncodedValue = this._getStoredProperty(name);
    if (encodedValue === oldEncodedValue) {
      return;
    }
    if (encodedValue === undefined && this._props) {
      delete this._props[name];
    } else {
      if (!this._props) {
        this._props = {};
      }
      this._props[name] = encodedValue;
    }
    this._triggerChangeEvent(name, encodedValue);
  };

  NativeObject.prototype._getStoredProperty = function _getStoredProperty (name) {
    var result = this._props ? this._props[name] : undefined;
    if (result === undefined) {
      result = this._getDefaultPropertyValue(name);
    }
    return result;
  };

  NativeObject.prototype._getTypeDef = function _getTypeDef (name) {
    var prop = this['$prop_' + name];
    return prop ? prop.type : null;
  };

  NativeObject.prototype._getDefaultPropertyValue = function _getDefaultPropertyValue (name) {
    var prop = this['$prop_' + name];
    return prop ? valueOf(prop.default) : undefined;
  };

  NativeObject.prototype._encodeProperty = function _encodeProperty (typeDef, value) {
    return (typeDef && typeDef.encode) ? typeDef.encode(value) : value;
  };

  NativeObject.prototype._decodeProperty = function _decodeProperty (typeDef, value) {
    return (typeDef && typeDef.decode) ? typeDef.decode(value) : value;
  };

  NativeObject.prototype.$getPropertyGetter = function $getPropertyGetter (name) {
    var prop = this['$prop_' + name];
    return prop ? prop.get : undefined;
  };

  NativeObject.prototype.$getPropertySetter = function $getPropertySetter (name) {
    var prop = this['$prop_' + name];
    return prop ? prop.set : undefined;
  };

  NativeObject.prototype._triggerChangeEvent = function _triggerChangeEvent (propertyName, newEncodedValue) {
    var typeDef = this._getTypeDef(propertyName);
    var decodedValue = this._decodeProperty(typeDef, newEncodedValue);
    this.$trigger(propertyName + 'Changed', {value: decodedValue});
  };

  NativeObject.prototype._create = function _create (type, properties) {
    if ( properties === void 0 ) properties = {};

    tabris._nativeBridge.create(this.cid, type);
    this._reorderProperties(Object.keys(properties)).forEach(function(name) {
      setExistingProperty.call(this, name, properties[name]);
    }, this);
    return this;
  };

  NativeObject.prototype._reorderProperties = function _reorderProperties (properties) {
    return properties;
  };

  NativeObject.prototype.dispose = function dispose () {
    this._dispose();
  };

  NativeObject.prototype._dispose = function _dispose (skipNative) {
    if (!this._isDisposed && !this._inDispose) {
      this._inDispose = true;
      this._trigger('dispose');
      this._release();
      if (!skipNative) {
        tabris._nativeBridge.destroy(this.cid);
      }
      tabris._proxies.remove(this.cid);
      delete this._props;
      this._isDisposed = true;
    }
  };

  NativeObject.prototype._release = function _release () {
  };

  NativeObject.prototype.isDisposed = function isDisposed () {
    return !!this._isDisposed;
  };

  NativeObject.prototype._listen = function _listen (/* name, listening */) {
  };

  NativeObject.prototype._nativeListen = function _nativeListen (event, state) {
    this._checkDisposed();
    tabris._nativeBridge.listen(this.cid, event, state);
  };

  NativeObject.prototype._trigger = function _trigger (name, eventData) {
    if ( eventData === void 0 ) eventData = {};

    return this.$trigger(name, eventData);
  };

  NativeObject.prototype.$trigger = function $trigger (name, eventData) {
    if ( eventData === void 0 ) eventData = {};

    var event = new EventObject(name, this, eventData);
    this.trigger(name, event);
    return !!event.defaultPrevented;
  };

  NativeObject.prototype._onoff = function _onoff (name, listening, listener) {
    listening ? this.on(name, listener) : this.off(name, listener);
  };

  NativeObject.prototype._checkDisposed = function _checkDisposed () {
    if (this._isDisposed) {
      throw new Error('Object is disposed');
    }
  };

  NativeObject.prototype._nativeSet = function _nativeSet (name, value) {
    this._checkDisposed();
    tabris._nativeBridge.set(this.cid, name, value);
  };

  NativeObject.prototype._nativeGet = function _nativeGet (name) {
    this._checkDisposed();
    return tabris._nativeBridge.get(this.cid, name);
  };

  NativeObject.prototype._nativeCall = function _nativeCall (method, parameters) {
    this._checkDisposed();
    return tabris._nativeBridge.call(this.cid, method, parameters);
  };

  NativeObject.prototype.toString = function toString () {
    return this.constructor.name;
  };

  return NativeObject;
}(EventsClass));

function setExistingProperty(name, value) {
  if (name in this) {
    this[name] = value;
  } else {
    console.warn('Unknown property "' + name + '"');
  }
}

function normalizeProperty(property) {
  var config = typeof property === 'string' ? {type: property} : property;
  return {
    type: resolveType(config.type || 'any'),
    default: config.default,
    nocache: config.nocache,
    set: config.readonly && readOnlySetter || config.set || defaultSetter,
    get: config.get || defaultGetter
  };
}

function resolveType(type) {
  var typeDef = type;
  if (typeof type === 'string') {
    typeDef = types[type];
  } else if (Array.isArray(type)) {
    typeDef = types[type[0]];
  }
  if (typeof typeDef !== 'object') {
    throw new Error('Can not find property type ' + type);
  }
  if (Array.isArray(type)) {
    typeDef = Object.assign({}, typeDef);
    var args = type.slice(1);
    if (typeDef.encode) {
      typeDef.encode = wrapCoder(typeDef.encode, args);
    }
    if (typeDef.decode) {
      typeDef.decode = wrapCoder(typeDef.decode, args);
    }
  }
  return typeDef;
}

function wrapCoder(fn, args) {
  return function(value) {
    return fn.apply(global, [value].concat(args));
  };
}

function readOnlySetter(name) {
  console.warn(("Can not set read-only property \"" + name + "\""));
}

function defaultSetter(name, value) {
  this._nativeSet(name, value);
  if (this['$prop_' + name].nocache) {
    this._triggerChangeEvent(name, value);
  } else {
    this._storeProperty(name, value);
  }
}

function defaultGetter(name) {
  var result = this._getStoredProperty(name);
  if (result === undefined) {
    // TODO: cache read property, but not for device properties
    result = this._nativeGet(name);
  }
  return result;
}

function valueOf(value) {
  return value instanceof Function ? value() : value;
}

var WidgetCollection = function WidgetCollection(arr, selector, deep) {
  var this$1 = this;

  this._array = select(arr, selector || '*', deep);
  for (var i = 0; i < this._array.length; i++) {
    this$1[i] = this$1._array[i];
  }
};

var prototypeAccessors$2 = { length: {} };

prototypeAccessors$2.length.get = function () {
  return this._array.length;
};

WidgetCollection.prototype.first = function first () {
  return this._array[0];
};

WidgetCollection.prototype.last = function last () {
  return this._array[this._array.length - 1];
};

WidgetCollection.prototype.toArray = function toArray () {
  return this._array.concat();
};

WidgetCollection.prototype.forEach = function forEach (callback) {
    var this$1 = this;

  this._array.forEach(function (value, index) { return callback(value, index, this$1); });
};

WidgetCollection.prototype.indexOf = function indexOf (needle) {
  return this._array.indexOf(needle);
};

WidgetCollection.prototype.includes = function includes (needle) {
  return this._array.indexOf(needle) !== -1;
};

WidgetCollection.prototype.filter = function filter (selector) {
  return new WidgetCollection(this._array, selector);
};

WidgetCollection.prototype.get = function get (prop) {
  if (this._array[0]) {
    return this._array[0].get(prop);
  }
};

WidgetCollection.prototype.parent = function parent () {
    var this$1 = this;

  var result = [];
  for (var i = 0, list = this$1._array; i < list.length; i += 1) {
    var widget = list[i];

      var parent = widget.parent();
    if (parent && result.indexOf(parent) === -1) {
      result.push(parent);
    }
  }
  if (result.length) {
    return new WidgetCollection(result);
  }
};

WidgetCollection.prototype.children = function children (selector) {
    var this$1 = this;

  var result = [];
  for (var i = 0, list = this$1._array; i < list.length; i += 1) {
    var widget = list[i];

      result.push.apply(result, widget._getSelectableChildren() || []);
  }
  return new WidgetCollection(result, selector);
};

WidgetCollection.prototype.find = function find (selector) {
  return new WidgetCollection(this.children()._array, selector, true);
};

WidgetCollection.prototype.appendTo = function appendTo (parent) {
  parent.append(this);
};

WidgetCollection.prototype.set = function set () {
    var arguments$1 = arguments;

  this._array.forEach(function (widget) { return widget.set.apply(widget, arguments$1); });
  return this;
};

WidgetCollection.prototype.on = function on () {
    var arguments$1 = arguments;

  this._array.forEach(function (widget) { return widget.on.apply(widget, arguments$1); });
  return this;
};

WidgetCollection.prototype.off = function off () {
    var arguments$1 = arguments;

  this._array.forEach(function (widget) { return widget.off.apply(widget, arguments$1); });
  return this;
};

WidgetCollection.prototype.once = function once () {
    var arguments$1 = arguments;

  this._array.forEach(function (widget) { return widget.once.apply(widget, arguments$1); });
  return this;
};

WidgetCollection.prototype.trigger = function trigger () {
    var arguments$1 = arguments;

  this._array.forEach(function (widget) { return widget.trigger.apply(widget, arguments$1); });
  return this;
};

WidgetCollection.prototype.animate = function animate () {
    var arguments$1 = arguments;

  this._array.forEach(function (widget) { return widget.animate.apply(widget, arguments$1); });
};

WidgetCollection.prototype.dispose = function dispose () {
    var arguments$1 = arguments;

  this._array.forEach(function (widget) { return widget.dispose.apply(widget, arguments$1); });
};

Object.defineProperties( WidgetCollection.prototype, prototypeAccessors$2 );

function select(array, selector, deep) {
  if (!array || array.length === 0) {
    return [];
  }
  if (selector === '*' && !deep) {
    return array.concat();
  }
  var filter = getFilter(selector);
  if (deep) {
    return deepSelect([], array, filter);
  }
  return array.filter(filter);
}

function deepSelect(result, array, filter) {
  for (var i = 0, list = array; i < list.length; i += 1) {
    var widget = list[i];

    if (filter(widget)) {
      result.push(widget);
    }
    if (widget._children) {
      deepSelect(result, widget._getSelectableChildren(), filter);
    }
  }
  return result;
}

function getFilter(selector) {
  var matches = {};
  var filter = selector instanceof Function ? selector : createMatcher(selector);
  return function (widget) {
    if (matches[widget.cid]) {
      return false;
    }
    if (filter(widget)) {
      matches[widget.cid] = true;
      return true;
    }
    return false;
  };
}

function createMatcher(selector) {
  if (selector.charAt(0) === '#') {
    var expectedId = selector.slice(1);
    return function (widget) { return expectedId === widget.id; };
  }
  if (selector.charAt(0) === '.') {
    var expectedClass = selector.slice(1);
    return function (widget) { return widget.classList.indexOf(expectedClass) !== -1; };
  }
  if (selector === '*') {
    return function () { return true; };
  }
  return function (widget) { return selector === widget.constructor.name; };
}

var types = {

  any: {},

  boolean: {
    encode: function encode(bool) {
      return !!bool;
    }
  },

  string: {
    encode: function encode(str) {
      return '' + str;
    }
  },

  number: {
    encode: function encode(value) {
      return encodeNumber(value);
    }
  },

  natural: {
    encode: function encode(value) {
      value = encodeNumber(value);
      return value < 0 ? 0 : Math.round(value);
    }
  },

  integer: {
    encode: function encode(value) {
      value = encodeNumber(value);
      return Math.round(value);
    }
  },

  function: {
    encode: function encode(value) {
      if ('function' !== typeof value) {
        throw new Error(typeof value + ' is not a function: ' + value);
      }
      return value;
    }
  },

  choice: {
    encode: function encode(value, acceptable) {
      if (acceptable.indexOf(value) === -1) {
        throwNotAcceptedError(acceptable, value);
      }
      return value;
    }
  },

  color: {
    encode: function encode(value) {
      if (value === 'initial') {
        return undefined;
      }
      return colorStringToArray(value);
    },
    decode: function decode(value) {
      if (!value) {
        // NOTE: null is only returned for "background" where it means "no background"
        return 'rgba(0, 0, 0, 0)';
      }
      return colorArrayToString(value);
    }
  },

  font: {
    encode: function encode(value) {
      if (value === 'initial') {
        return undefined;
      }
      return fontStringToObject(value);
    },
    decode: function decode(value) {
      if (!value) {
        // NOTE: workaround to allow triggering a change event when setting font to "initial"
        return 'initial';
      }
      return fontObjectToString(value);
    }
  },

  image: {
    encode: function encode(value) {
      if (!value) {
        return null;
      }
      if (typeof value === 'string') {
        value = {src: value};
      }
      if (typeof value !== 'object') {
        throw new Error('Not an image: ' + value);
      }
      if (typeof value.src !== 'string') {
        throw new Error('image.src is not a string');
      }
      if (value.src === '') {
        throw new Error('image.src is an empty string');
      }
      ['scale', 'width', 'height'].forEach(function (prop) {
        if (prop in value && !isDimension(value[prop])) {
          throw new Error('image.' + prop + ' is not a dimension: ' + value[prop]);
        }
      });
      if ('scale' in value && ('width' in value || 'height' in value)) {
        console.warn('Image scale is ignored if width or height are given');
      }
      return imageToArray(value);
    },
    decode: function decode(value) {
      if (!value) {
        return null;
      }
      return imageFromArray(value);
    }
  },

  layoutData: {
    encode: function encode(value) {
      return encodeLayoutData(value);
    },
    decode: function decode(value) {
      return decodeLayoutData(value);
    }
  },

  edge: {
    encode: function encode(value) {
      return value == null ? null : encodeEdge(value);
    },
    decode: decodeLayoutAttr
  },

  dimension: {
    encode: function encode(value) {
      return value == null ? null : encodeNumber(value);
    },
    decode: decodeLayoutAttr
  },

  sibling: {
    encode: function encode(value) {
      return value == null ? null : encodeWidgetRef(value);
    },
    decode: decodeLayoutAttr
  },

  bounds: {
    encode: function encode(value) {
      return [value.left, value.top, value.width, value.height];
    },
    decode: function decode(value) {
      return {left: value[0], top: value[1], width: value[2], height: value[3]};
    }
  },

  proxy: {
    encode: function encode(value) {
      if (value instanceof NativeObject) {
        return value.cid;
      }
      if (value instanceof WidgetCollection) {
        return value[0] ? value[0].cid : null;
      }
      // TODO: Should throw error instead
      return value;
    },
    decode: function decode(cid) {
      return tabris._proxies.find(cid);
    }
  },

  nullable: {
    encode: function encode(value, altCheck) {
      if (value === null) {
        return value;
      }
      return types[altCheck].encode(value);
    }
  },

  opacity: {
    encode: function encode(value) {
      value = encodeNumber(value);
      return Math.max(0, Math.min(1, value));
    }
  },

  transform: {
    encode: function encode(value) {
      var result = Object.assign({}, transformDefaults);
      for (var key in value) {
        if (!(key in transformDefaults)) {
          throw new Error('Not a valid transformation containing "' + key + '"');
        }
        result[key] = encodeNumber(value[key]);
      }
      return result;
    }
  },

  array: {
    encode: function encode(value, type) {
      if (value == null) {
        return [];
      }
      if (!(value instanceof Array)) {
        throw new Error(typeof value + ' is not an array: ' + value);
      }
      if (type) {
        return value.map(types[type].encode);
      }
      return value;
    }
  }

};

var numberRegex = /^[+-]?([0-9]+|[0-9]*\.[0-9]+)$/;
var selectorRegex = /^(\*|prev\(\)|([#.]?[A-Za-z_][A-Za-z0-9_-]+))$/;

function isDimension(value) {
  return typeof value === 'number' && !isNaN(value) && value >= 0 && value !== Infinity;
}

function throwNotAcceptedError(acceptable, given) {
  var message = ['Accepting "'];
  message.push(acceptable.join('", "'));
  message.push('", given was: "', given + '"');
  throw new Error(message.join(''));
}

function encodeNumber(value) {
  if (typeof value === 'string' && numberRegex.test(value)) {
    return parseFloat(value);
  }
  if (typeof value !== 'number') {
    throw new Error('Not a number: ' + toString(value));
  }
  if (!isFinite(value)) {
    throw new Error('Invalid number: ' + toString(value));
  }
  return value;
}

var transformDefaults = {
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  translationX: 0,
  translationY: 0,
  translationZ: 0
};

var layoutEncoders = {
  width: encodeNumber,
  height: encodeNumber,
  left: encodeEdge,
  right: encodeEdge,
  top: encodeEdge,
  bottom: encodeEdge,
  centerX: encodeNumber,
  centerY: encodeNumber,
  baseline: encodeWidgetRef
};

function encodeLayoutData(layoutData) {
  var result = {};
  for (var key in layoutData) {
    if (layoutData[key] != null) {
      if (!(key in layoutEncoders)) {
        throw new Error("Invalid key '" + key + "' in layoutData");
      }
      try {
        result[key] = layoutEncoders[key](layoutData[key]);
      } catch (error) {
        throw new Error("Invalid value for '" + key + "': " + error.message);
      }
    }
  }
  return result;
}

function encodeEdge(value) {
  if (typeof value === 'string') {
    if (value.indexOf(' ') !== -1) {
      return encodeEdgeArray(value.split(/\s+/));
    }
    if (value[value.length - 1] === '%') {
      var percentage = encodePercentage(value);
      return percentage === 0 ? 0 : [percentage, 0];
    }
    if (numberRegex.test(value)) {
      return [0, parseFloat(value)];
    }
    if (selectorRegex.test(value)) {
      return [value, 0];
    }
    throw new Error('Invalid dimension: ' + toString(value));
  }
  if (typeof value === 'number') {
    if (!isFinite(value)) {
      throw new Error('Invalid number: ' + toString(value));
    }
    return value;
  }
  if (Array.isArray(value)) {
    return encodeEdgeArray(value);
  }
  if (value instanceof NativeObject) {
    return [value, 0];
  }
  throw new Error('Invalid dimension: ' + toString(value));
}

function encodeEdgeArray(array) {
  if (array.length !== 2) {
    throw new Error('Wrong number of elements (must be 2): ' + toString(array));
  }
  var ref = encodeEdgeRef(array[0]);
  var offset = encodeNumber(array[1]);
  return ref === 0 ? offset : [ref, offset];
}

function encodeEdgeRef(value) {
  if (typeof value === 'string') {
    if (value[value.length - 1] === '%') {
      return encodePercentage(value);
    }
    if (selectorRegex.test(value)) {
      return value;
    }
  }
  if (typeof value === 'number') {
    if (!isFinite(value)) {
      throw new Error('Invalid number: ' + toString(value));
    }
    return value;
  }
  if (value instanceof NativeObject) {
    return value;
  }
  throw new Error('Not a percentage or widget reference: ' + toString(value));
}

function encodePercentage(value) {
  var sub = value.substr(0, value.length - 1);
  if (numberRegex.test(sub)) {
    return parseFloat(sub);
  }
  throw new Error('Invalid percentage value: ' + toString(value));
}

function encodeWidgetRef(value) {
  if (value instanceof NativeObject) {
    return value;
  }
  if (typeof value === 'string' && selectorRegex.test(value)) {
    return value;
  }
  throw new Error('Not a widget reference: ' + toString(value));
}

function decodeLayoutData(layoutData) {
  if (!layoutData) {
    return null;
  }
  var result = {};
  for (var key in layoutData) {
    result[key] = decodeLayoutAttr(layoutData[key]);
  }
  return result;
}

function decodeLayoutAttr(value) {
  if (Array.isArray(value)) {
    if (value[0] === 0) {
      return value[1];
    }
    if (value[1] === 0) {
      return typeof value[0] === 'number' ? value[0] + '%' : value[0];
    }
    return [typeof value[0] === 'number' ? value[0] + '%' : value[0], value[1]];
  }
  return value;
}

function toString(value) {
  if (typeof value === 'string') {
    return "'" + value + "'";
  }
  if (Array.isArray(value)) {
    return '[' + value.map(toString).join(', ') + ']';
  }
  if (typeof value === 'object' && value != null) {
    return '{' + Object.keys(value).join(', ') + '}';
  }
  return '' + value;
}

var Layout = {

  checkConsistency: function checkConsistency(layoutData) {
    var result = layoutData;
    if ('centerX' in result) {
      if (('left' in result) || ('right' in result)) {
        console.warn('Inconsistent layoutData: centerX overrides left and right');
        result = omit(result, ['left', 'right']);
      }
    }
    if ('baseline' in result) {
      if (('top' in result) || ('bottom' in result) || ('centerY' in result)) {
        console.warn('Inconsistent layoutData: baseline overrides top, bottom, and centerY');
        result = omit(result, ['top', 'bottom', 'centerY']);
      }
    } else if ('centerY' in result) {
      if (('top' in result) || ('bottom' in result)) {
        console.warn('Inconsistent layoutData: centerY overrides top and bottom');
        result = omit(result, ['top', 'bottom']);
      }
    }
    if ('left' in result && 'right' in result && 'width' in result) {
      console.warn('Inconsistent layoutData: left and right are set, ignore width');
      result = omit(result, ['width']);
    }
    if ('top' in result && 'bottom' in result && 'height' in result) {
      console.warn('Inconsistent layoutData: top and bottom are set, ignore height');
      result = omit(result, ['height']);
    }
    return result;
  },

  resolveReferences: function resolveReferences(layoutData, targetWidget) {
    if (!targetWidget) {
      return layoutData;
    }
    var result = {};
    for (var key in layoutData) {
      result[key] = resolveAttribute(layoutData[key], targetWidget);
    }
    return result;
  },

  addToQueue: function addToQueue(parent) {
    layoutQueue[parent.cid] = parent;
  },

  flushQueue: function flushQueue() {
    for (var cid in layoutQueue) {
      layoutQueue[cid]._flushLayout();
    }
    layoutQueue = {};
  }

};

var layoutQueue = {};

function resolveAttribute(value, widget) {
  if (Array.isArray(value)) {
    return resolveArray(value, widget);
  }
  if (isNumber(value)) {
    return value;
  }
  return toProxyId(value, widget);
}

function resolveArray(array, widget) {
  if (isNumber(array[0])) {
    return array;
  }
  return [toProxyId(array[0], widget), array[1]];
}

function toProxyId(ref, widget) {
  if (ref === 'prev()') {
    var children = getParent(widget).children();
    var index = children.indexOf(widget);
    if (index > 0) {
      return types.proxy.encode(children[index - 1]) || 0;
    }
    return 0;
  }
  if (typeof ref === 'string') {
    var proxy = getParent(widget).children(ref)[0];
    return types.proxy.encode(proxy) || 0;
  }
  return types.proxy.encode(ref) || 0;
}

function isNumber(value) {
  return typeof value === 'number' && isFinite(value);
}

function getParent(widget) {
  return widget.parent() || emptyParent;
}

var emptyParent = {
  children: function children() {
    return [];
  }
};

var NativeBridge = function NativeBridge(bridge) {
  this.$bridge = bridge;
  this.$operations = [];
  this.$currentOperation = {id: null};
  tabris.on('flush', this.flush, this);
};

NativeBridge.prototype.create = function create (id, type) {
  var properties = {};
  this.$operations.push(['create', id, type, properties]);
  this.$currentOperation = {id: id, properties: properties};
};

NativeBridge.prototype.set = function set (id, name, value) {
  if (this.$currentOperation.id === id) {
    this.$currentOperation.properties[name] = value;
  } else {
    var properties = {};
    properties[name] = value;
    this.$operations.push(['set', id, properties]);
    this.$currentOperation = {id: id, properties: properties};
  }
};

NativeBridge.prototype.listen = function listen (id, event, listen$1) {
  this.$operations.push(['listen', id, event, listen$1]);
  this.$currentOperation = {id: null};
};

NativeBridge.prototype.destroy = function destroy (id) {
  this.$operations.push(['destroy', id]);
  this.$currentOperation = {id: null};
};

NativeBridge.prototype.get = function get (id, name) {
  this.flush();
  return this.$bridge.get(id, name);
};

NativeBridge.prototype.call = function call (id, method, parameters) {
  this.flush();
  return this.$bridge.call(id, method, parameters);
};

NativeBridge.prototype.flush = function flush () {
    var this$1 = this;

  Layout.flushQueue();
  var operations = this.$operations;
  this.$operations = [];
  this.$currentOperation = {id: null};
  var length = operations.length;
  // Using apply() on the native bridge does not work with Rhino. It seems that the parameter
  // count must be known in order to find the associated native method.
  for (var i = 0; i < length; i++) {
    var op = operations[i];
    switch (op[0]) {
      case 'create':
        this$1.$bridge.create(op[1], op[2], op[3]);
        break;
      case 'set':
        this$1.$bridge.set(op[1], op[2]);
        break;
      case 'listen':
        this$1.$bridge.listen(op[1], op[2], op[3]);
        break;
      case 'destroy':
        this$1.$bridge.destroy(op[1]);
    }
  }
};

var ProxyStore = function ProxyStore() {
  this.$idSequence = 1;
  this.$proxies = {};
};

ProxyStore.prototype.register = function register (proxy, withcid) {
  var cid = withcid || this.$generateId();
  if (cid in this.$proxies) {
    throw new Error('cid already in use: ' + cid);
  }
  this.$proxies[cid] = proxy;
  return cid;
};

ProxyStore.prototype.remove = function remove (cid) {
  delete this.$proxies[cid];
};

ProxyStore.prototype.find = function find (cid) {
  return this.$proxies[cid] || null;
};

ProxyStore.prototype.$generateId = function $generateId () {
  return 'o' + (this.$idSequence++);
};

var Tabris = function Tabris() {
  this._started = false;
  this._init = this._init.bind(this);
  this._notify = this._notify.bind(this);
};

var prototypeAccessors = { version: {},started: {} };

prototypeAccessors.version.get = function () {
  return '${VERSION}';
};

prototypeAccessors.started.get = function () {
  return !!this._started;
};

Tabris.prototype._init = function _init (client) {
  this._client = client;
  this._proxies = new ProxyStore();
  this._nativeBridge = new NativeBridge(client);
  this.trigger('start');
  this._started = true;
};

Tabris.prototype._setEntryPoint = function _setEntryPoint (entryPoint) {
  this._entryPoint = entryPoint;
};

Tabris.prototype._notify = function _notify (cid, event, param) {
  var returnValue;
  try {
    var proxy = this._proxies.find(cid);
    if (proxy) {
      try {
        returnValue = proxy._trigger(event, param);
      } catch (error) {
        console.error(error);
        console.log(error.stack);
      }
    }
    this.trigger('flush');
  } catch (ex) {
    console.error(ex);
    console.log(ex.stack);
  }
  return returnValue;
};

Object.defineProperties( Tabris.prototype, prototypeAccessors );

Object.assign(Tabris.prototype, Events);

var Device = (function (NativeObject$$1) {
  function Device() {
    NativeObject$$1.call(this, 'tabris.Device');
    if (arguments[0] !== true) {
      throw new Error('Device can not be created');
    }
    this._create('tabris.Device');
  }

  if ( NativeObject$$1 ) Device.__proto__ = NativeObject$$1;
  Device.prototype = Object.create( NativeObject$$1 && NativeObject$$1.prototype );
  Device.prototype.constructor = Device;

  Device.prototype._listen = function _listen (name, listening) {
    if (name === 'orientationChanged') {
      this._nativeListen(name, listening);
    } else {
      NativeObject$$1.prototype._listen.call(this, name, listening);
    }
  };

  Device.prototype._trigger = function _trigger (name, event) {
    if (name === 'orientationChanged') {
      this._triggerChangeEvent('orientation', event.orientation);
    } else {
      NativeObject$$1.prototype._trigger.call(this, name, event);
    }
  };

  Device.prototype.dispose = function dispose () {
    throw new Error('Cannot dispose device object');
  };

  return Device;
}(NativeObject));

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

function create() {
  return new Device(true);
}

function publishDeviceProperties(device, target) {
  target.devicePixelRatio = device.scaleFactor;
  target.device = createDevice(device);
  target.screen = createScreen(device);
  target.navigator = createNavigator(device);
}

function createDevice(device) {
  var dev = {};
  ['model', 'platform', 'version'].forEach(function (name) {
    defineReadOnlyProperty(dev, name, function () { return device[name]; });
  });
  return dev;
}

function createScreen(device) {
  var screen = {};
  defineReadOnlyProperty(screen, 'width', function () { return device.screenWidth; });
  defineReadOnlyProperty(screen, 'height', function () { return device.screenHeight; });
  return screen;
}

function createNavigator(device) {
  var navigator = {};
  defineReadOnlyProperty(navigator, 'userAgent', function () { return 'tabris-js'; });
  defineReadOnlyProperty(navigator, 'language', function () { return device.language; });
  return navigator;
}

function defineReadOnlyProperty(target, name, getter) {
  Object.defineProperty(target, name, {
    get: getter,
    set: function set() {}
  });
}

var CERTIFICATE_ALGORITHMS = ['RSA2048', 'RSA4096', 'ECDSA256'];
var EVENT_TYPES = ['foreground', 'background', 'pause', 'resume', 'terminate', 'backNavigation',
  'certificatesReceived'];

var App = (function (NativeObject$$1) {
  function App() {
    NativeObject$$1.call(this, 'tabris.App');
    if (arguments[0] !== true) {
      throw new Error('App can not be created');
    }
    this._create('tabris.App');
  }

  if ( NativeObject$$1 ) App.__proto__ = NativeObject$$1;
  App.prototype = Object.create( NativeObject$$1 && NativeObject$$1.prototype );
  App.prototype.constructor = App;

  var prototypeAccessors = { id: {},version: {},versionCode: {} };

  prototypeAccessors.id.get = function () {
    return this._nativeGet('appId');
  };

  prototypeAccessors.version.get = function () {
    return this._nativeGet('version');
  };

  prototypeAccessors.versionCode.get = function () {
    return this._nativeGet('versionId');
  };

  App.prototype.getResourceLocation = function getResourceLocation (path) {
    if (!this._resourceBaseUrl) {
      this._resourceBaseUrl = this._nativeGet('resourceBaseUrl');
    }
    var subPath = path != null ? '/' + normalizePath('' + path) : '';
    return this._resourceBaseUrl + subPath;
  };

  App.prototype.dispose = function dispose () {
    throw new Error('tabris.app can not be disposed');
  };

  App.prototype.reload = function reload () {
    this._nativeCall('reload', {});
  };

  App.prototype.installPatch = function installPatch (url, callback) {
    if (typeof url !== 'string') {
      throw new Error('parameter url is not a string');
    }
    if (!this._pendingPatchCallback) {
      this._pendingPatchCallback = callback || true;
      this._nativeListen('patchInstall', true);
      this._nativeCall('installPatch', {url: url});
    } else if (typeof callback === 'function') {
      callback(new Error('Another installPatch operation is already pending.'));
    }
  };

  App.prototype._listen = function _listen (name, listening) {
    if (EVENT_TYPES.includes(name)) {
      this._nativeListen(name, listening);
    } else {
      NativeObject$$1.prototype._listen.call(this, name, listening);
    }
  };

  App.prototype._trigger = function _trigger (name, event) {
    if ( event === void 0 ) event = {};

    if (name === 'patchInstall') {
      this._nativeListen('patchInstall', false);
      var callback = this._pendingPatchCallback;
      delete this._pendingPatchCallback;
      if (typeof callback === 'function') {
        if (event.error) {
          callback(new Error(event.error));
        } else {
          try {
            var patch = event.success ? JSON.parse(event.success) : null;
            callback(null, patch);
          } catch (error) {
            callback(new Error('Failed to parse patch.json'));
          }
        }
      }
    } else {
      return NativeObject$$1.prototype._trigger.call(this, name, event);
    }
  };

  App.prototype._validateCertificate = function _validateCertificate (event) {
    var hashes = this.$pinnedCerts[event.host];
    if (hashes && !hashes.some(function (hash) { return event.hashes.includes(hash); })) {
      event.preventDefault();
    }
  };

  Object.defineProperties( App.prototype, prototypeAccessors );

  return App;
}(NativeObject));

NativeObject.defineProperties(App.prototype, {
  pinnedCertificates: {
    type: 'array',
    default: function default$1() {
      return [];
    },
    set: function set(name, value) {
      this.$pinnedCerts = checkCertificates(value);
      this.on('certificatesReceived', this._validateCertificate, this);
      this._storeProperty(name, value);
      this._nativeSet(name, value);
    }
  }
});

function checkCertificates(certificates) {
  var hashes = {};
  for (var i = 0, list = certificates; i < list.length; i += 1) {
    var cert = list[i];

    if (typeof cert.host !== 'string') {
      throw new Error('Invalid host for pinned certificate: ' + cert.host);
    }
    if (typeof cert.hash !== 'string' || !cert.hash.startsWith('sha256/')) {
      throw new Error('Invalid hash for pinned certificate: ' + cert.hash);
    }
    if (tabris.device.platform === 'iOS') {
      if (!('algorithm' in cert)) {
        throw new Error('Missing algorithm for pinned certificate: ' + cert.host);
      }
      if (typeof cert.algorithm !== 'string' || CERTIFICATE_ALGORITHMS.indexOf(cert.algorithm) === -1) {
        throw new Error('Invalid algorithm for pinned certificate: ' + cert.algorithm);
      }
    }
    hashes[cert.host] = hashes[cert.host] || [];
    hashes[cert.host].push(cert.hash);
  }
  return hashes;
}

function create$1() {
  return new App(true);
}

function normalizePath(path) {
  return path.split(/\/+/).map(function (segment) {
    if (segment === '..') {
      throw new Error("Path must not contain '..'");
    }
    if (segment === '.') {
      return '';
    }
    return segment;
  }).filter(function (string) { return !!string; }).join('/');
}

var GestureRecognizer = (function (NativeObject$$1) {
  function GestureRecognizer(properties) {
    NativeObject$$1.call(this);
    this._create('tabris.GestureRecognizer', properties);
  }

  if ( NativeObject$$1 ) GestureRecognizer.__proto__ = NativeObject$$1;
  GestureRecognizer.prototype = Object.create( NativeObject$$1 && NativeObject$$1.prototype );
  GestureRecognizer.prototype.constructor = GestureRecognizer;

  GestureRecognizer.prototype._listen = function _listen (name, listening) {
    if (name === 'gesture') {
      this._nativeListen(name, listening);
    } else {
      NativeObject$$1.prototype._listen.call(this, name, listening);
    }
  };

  return GestureRecognizer;
}(NativeObject));

NativeObject.defineProperties(GestureRecognizer.prototype, {
  type: 'string',
  target: 'proxy',
  fingers: 'natural',
  touches: 'natural',
  duration: 'natural',
  direction: 'string'
});

var ANIMATABLE_PROPERTIES = ['opacity', 'transform'];

var PROPERTIES = {
  properties: {type: 'any'},
  delay: {type: 'natural'},
  duration: {type: 'natural'},
  repeat: {type: 'natural'},
  reverse: {type: 'boolean'},
  easing: {type: ['choice', ['linear', 'ease-in', 'ease-out', 'ease-in-out']]},
  target: {type: 'proxy'}
};

var Animation = (function (NativeObject$$1) {
  function Animation(properties) {
    NativeObject$$1.call(this);
    this._create('tabris.Animation', properties);
    this._nativeListen('completed', true);
  }

  if ( NativeObject$$1 ) Animation.__proto__ = NativeObject$$1;
  Animation.prototype = Object.create( NativeObject$$1 && NativeObject$$1.prototype );
  Animation.prototype.constructor = Animation;

  Animation.prototype._trigger = function _trigger (name, event) {
    if (name === 'completed') {
      this.target.off('dispose', this.abort, this);
      if (this._resolve) {
        this._resolve();
      }
      this.dispose();
    } else {
      NativeObject$$1.prototype._trigger.call(this, name, event);
    }
  };

  Animation.prototype.start = function start (resolve, reject) {
    this.target.on('dispose', this.abort, this);
    this._resolve = resolve;
    this._reject = reject;
    this._nativeCall('start');
  };

  Animation.prototype.abort = function abort () {
    if (this._reject) {
      this._reject();
    }
    this.dispose();
  };

  return Animation;
}(NativeObject));

NativeObject.defineProperties(Animation.prototype, PROPERTIES);

function animate(properties, options) {
  var this$1 = this;

  var animatedProps = {};
  for (var property in properties) {
    if (ANIMATABLE_PROPERTIES.includes(property)) {
      try {
        animatedProps[property] =
          this$1._encodeProperty(this$1._getTypeDef(property), properties[property]);
        this$1._storeProperty(property, animatedProps[property], options);
      } catch (ex) {
        console.warn(this$1 + ': Ignored invalid animation property value for "' + property + '"');
      }
    } else {
      console.warn(this$1 + ': Ignored invalid animation property "' + property + '"');
    }
  }
  for (var option in options) {
    if (!(option in PROPERTIES) && option !== 'name') {
      console.warn(this$1 + ': Ignored invalid animation option "' + option + '"');
    }
  }
  return new Promise(function (resolve, reject) {
    new Animation(Object.assign({}, options, {
      target: this$1,
      properties: animatedProps
    })).start(resolve, reject);
  });
}

var EVENT_TYPES$1 = ['touchStart', 'touchMove', 'touchEnd', 'touchCancel', 'resize'];

var Widget = (function (NativeObject$$1) {
  function Widget(properties) {
    NativeObject$$1.call(this);
    if (this.constructor === Widget) {
      throw new Error('Cannot instantiate abstract Widget');
    }
    if (this._nativeType) {
      this._create(this._nativeType, properties);
    }
  }

  if ( NativeObject$$1 ) Widget.__proto__ = NativeObject$$1;
  Widget.prototype = Object.create( NativeObject$$1 && NativeObject$$1.prototype );
  Widget.prototype.constructor = Widget;

  var prototypeAccessors = { data: {},classList: {} };

  Widget.prototype.append = function append () {
    var this$1 = this;

    this._checkDisposed();
    var accept = function (widget) {
      if (!(widget instanceof NativeObject$$1)) {
        throw new Error('Cannot append non-widget');
      }
      widget._setParent(this$1);
    };
    if (arguments[0] instanceof WidgetCollection) {
      arguments[0].toArray().forEach(accept);
    } else if (Array.isArray(arguments[0])) {
      arguments[0].forEach(accept);
    } else {
      Array.prototype.forEach.call(arguments, accept);
    }
    return this;
  };

  Widget.prototype.appendTo = function appendTo (widget) {
    this._checkDisposed();
    widget = widget instanceof WidgetCollection ? widget.first() : widget;
    if (!(widget instanceof NativeObject$$1)) {
      throw new Error('Cannot append to non-widget');
    }
    this._setParent(widget);
    return this;
  };

  Widget.prototype.insertBefore = function insertBefore (widget) {
    this._checkDisposed();
    widget = widget instanceof WidgetCollection ? widget.first() : widget;
    if (!(widget instanceof NativeObject$$1)) {
      throw new Error('Cannot insert before non-widget');
    }
    var parent = widget.parent();
    if (!parent) {
      throw new Error('Cannot insert before orphan');
    }
    var index = parent._children.indexOf(widget);
    this._setParent(parent, index);
    return this;
  };

  Widget.prototype.insertAfter = function insertAfter (widget) {
    this._checkDisposed();
    widget = widget instanceof WidgetCollection ? widget.first() : widget;
    if (!(widget instanceof NativeObject$$1)) {
      throw new Error('Cannot insert after non-widget');
    }
    var parent = widget.parent();
    if (!parent) {
      throw new Error('Cannot insert after orphan');
    }
    var index = parent._children.indexOf(widget);
    this._setParent(parent, index + 1);
    return this;
  };

  Widget.prototype.detach = function detach () {
    this._checkDisposed();
    this._setParent(null);
    return this;
  };

  Widget.prototype.parent = function parent () {
    return this._parent || null;
  };

  Widget.prototype.children = function children (selector) {
    return new WidgetCollection(this._getSelectableChildren(), selector);
  };

  Widget.prototype.siblings = function siblings (selector) {
    var this$1 = this;

    var siblings = (this._parent ? this._parent._getSelectableChildren() : []);
    var filtered = siblings.filter(function (widget) { return widget !== this$1; });
    return new WidgetCollection(filtered, selector);
  };

  Widget.prototype.find = function find (selector) {
    return new WidgetCollection(this._getSelectableChildren(), selector, true);
  };

  Widget.prototype.apply = function apply (sheet) {
    var scope = new WidgetCollection((this._children || []).concat(this), '*', true);
    if (sheet['*']) {
      scope.set(sheet['*']);
    }
    for (var selector in sheet) {
      if (selector !== '*' && selector[0] !== '#' && selector[0] !== '.') {
        scope.filter(selector).set(sheet[selector]);
      }
    }
    for (var selector$1 in sheet) {
      if (selector$1[0] === '.') {
        scope.filter(selector$1).set(sheet[selector$1]);
      }
    }
    for (var selector$2 in sheet) {
      if (selector$2[0] === '#') {
        scope.filter(selector$2).set(sheet[selector$2]);
      }
    }
    return this;
  };

  prototypeAccessors.data.get = function () {
    if (!this.$data) {
      this.$data = {};
    }
    return this.$data;
  };

  Widget.prototype._getContainer = function _getContainer () {
    return this;
  };

  Widget.prototype._getSelectableChildren = function _getSelectableChildren () {
    return this._children;
  };

  Widget.prototype._setParent = function _setParent (parent, index) {
    this._nativeSet('parent', parent ? types.proxy.encode(parent._getContainer(this)) : null);
    if (this._parent) {
      this._parent._removeChild(this);
      Layout.addToQueue(this._parent);
    }
    this._parent = parent;
    if (this._parent) {
      this._parent._addChild(this, index);
      Layout.addToQueue(this._parent);
    }
  };

  Widget.prototype._acceptChild = function _acceptChild () {
    return false;
  };

  Widget.prototype._addChild = function _addChild (child, index) {
    if (!this._acceptChild(child)) {
      throw new Error(child + ' could not be appended to ' + this);
    }
    if (!this._children) {
      this._children = [];
    }
    if (typeof index === 'number') {
      this._children.splice(index, 0, child);
      NativeObject$$1.prototype._trigger.call(this, 'addChild', {child: child, index: index});
    } else {
      this._children.push(child);
      NativeObject$$1.prototype._trigger.call(this, 'addChild', {child: child, index: this._children.length - 1});
    }
  };

  Widget.prototype._removeChild = function _removeChild (child) {
    if (this._children) {
      var index = this._children.indexOf(child);
      if (index !== -1) {
        this._children.splice(index, 1);
        NativeObject$$1.prototype._trigger.call(this, 'removeChild', {child: child, index: index});
      }
    }
  };

  Widget.prototype._release = function _release () {
    if (this._children) {
      var children = this._children.concat();
      for (var i = 0; i < children.length; i++) {
        children[i]._dispose(true);
      }
      delete this._children;
    }
    if (this._parent) {
      this._parent._removeChild(this);
      Layout.addToQueue(this._parent);
      delete this._parent;
    }
  };

  Widget.prototype._listen = function _listen (name, listening) {
    var this$1 = this;

    if (this.gestures[name]) {
      if (listening) {
        var properties = Object.assign({target: this}, this.gestures[name]);
        var recognizer = new GestureRecognizer(properties).on('gesture', function (event) {
          if (event.translation) {
            event.translationX = event.translation.x;
            event.translationY = event.translation.y;
          }
          if (event.velocity) {
            event.velocityX = event.velocity.x;
            event.velocityY = event.velocity.y;
          }
          NativeObject$$1.prototype._trigger.call(this$1, name, event);
        });
        if (!this._recognizers) {
          this._recognizers = {};
        }
        this._recognizers[name] = recognizer;
        this.on('dispose', recognizer.dispose, recognizer);
      } else if (this._recognizers && name in this._recognizers) {
        this._recognizers[name].dispose();
        delete this._recognizers[name];
      }
    } else if (name === 'boundsChanged') {
      this._onoff('resize', listening, this.$triggerChangeBounds);
    } else if (EVENT_TYPES$1.includes(name)) {
      this._nativeListen(name, listening);
    } else {
      NativeObject$$1.prototype._listen.call(this, name, listening);
    }
  };

  Widget.prototype._trigger = function _trigger (name, event) {
    var this$1 = this;

    if (name === 'resize') {
      if (hasAndroidResizeBug()) {
        setTimeout(function () { return NativeObject$$1.prototype._trigger.call(this$1, name, types.bounds.decode(event.bounds)); }, 0);
      } else {
        NativeObject$$1.prototype._trigger.call(this, name, types.bounds.decode(event.bounds));
      }
    } else {
      return NativeObject$$1.prototype._trigger.call(this, name, event);
    }
  };

  Widget.prototype.$triggerChangeBounds = function $triggerChangeBounds (ref) {
    var left = ref.left;
    var top = ref.top;
    var width = ref.width;
    var height = ref.height;

    NativeObject$$1.prototype._trigger.call(this, 'boundsChanged', {value: {left: left, top: top, width: width, height: height}});
  };

  Widget.prototype._flushLayout = function _flushLayout () {
    if (this._children) {
      this._children.forEach(function (child) {
        renderLayoutData.call(child);
      });
    }
  };

  prototypeAccessors.classList.get = function () {
    if (!this._classList) {
      this._classList = [];
    }
    return this._classList;
  };

  Object.defineProperties( Widget.prototype, prototypeAccessors );

  return Widget;
}(NativeObject));

NativeObject.defineProperties(Widget.prototype, {
  enabled: {
    type: 'boolean',
    default: true
  },
  visible: {
    type: 'boolean',
    default: true
  },
  layoutData: {
    type: 'layoutData',
    set: function set(name, value) {
      this._layoutData = value;
      if (this._parent) {
        Layout.addToQueue(this._parent);
      }
    },
    get: function get() {
      return this._layoutData || null;
    }
  },
  left: {type: 'edge', get: getLayoutProperty, set: setLayoutProperty},
  right: {type: 'edge', get: getLayoutProperty, set: setLayoutProperty},
  top: {type: 'edge', get: getLayoutProperty, set: setLayoutProperty},
  bottom: {type: 'edge', get: getLayoutProperty, set: setLayoutProperty},
  width: {type: 'dimension', get: getLayoutProperty, set: setLayoutProperty},
  height: {type: 'dimension', get: getLayoutProperty, set: setLayoutProperty},
  centerX: {type: 'dimension', get: getLayoutProperty, set: setLayoutProperty},
  centerY: {type: 'dimension', get: getLayoutProperty, set: setLayoutProperty},
  baseline: {type: 'sibling', get: getLayoutProperty, set: setLayoutProperty},
  elevation: {
    type: 'number',
    default: 0
  },
  font: {
    type: 'font',
    set: function set(name, value) {
      this._nativeSet(name, value === undefined ? null : value);
      this._storeProperty(name, value);
    },
    default: null
  },
  backgroundImage: {
    type: 'image'
  },
  bounds: {
    type: 'bounds',
    readonly: true
  },
  background: {
    type: 'color',
    set: function set(name, value) {
      this._nativeSet(name, value === undefined ? null : value);
      this._storeProperty(name, value);
    }
  },
  opacity: {
    type: 'opacity',
    default: 1
  },
  transform: {
    type: 'transform',
    default: function default$1() {
      return {
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        translationX: 0,
        translationY: 0,
        translationZ: 0
      };
    }
  },
  highlightOnTouch: {
    type: 'boolean',
    default: false
  },
  cornerRadius: {
    type: 'number',
    default: 0
  },
  id: {
    type: 'string',
    set: function set(name, value) {
      this._storeProperty(name, value);
    },
    get: function get(name) {
      return this._getStoredProperty(name);
    }
  },
  class: {
    type: 'string',
    set: function set(name, value) {
      this._classList = value.trim().split(/\s+/);
    },
    get: function get() {
      return this.classList.join(' ');
    }
  },
  gestures: {
    set: function set(name, gestures) {
      this._gestures = Object.assign({}, defaultGestures, gestures);
    },
    get: function get() {
      if (!this._gestures) {
        this._gestures = Object.assign({}, defaultGestures);
      }
      return this._gestures;
    }
  },
  win_theme: {
    type: ['choice', ['default', 'light', 'dark']],
    default: 'default'
  }
});

Widget.prototype.animate = animate;

function hasAndroidResizeBug() {
  if (!('cache' in hasAndroidResizeBug)) {
    hasAndroidResizeBug.cache = tabris.device.platform === 'Android' && tabris.device.version <= 17;
  }
  return hasAndroidResizeBug.cache;
}

var defaultGestures = {
  tap: {type: 'tap'},
  longpress: {type: 'longpress'},
  pan: {type: 'pan'},
  panLeft: {type: 'pan', direction: 'left'},
  panRight: {type: 'pan', direction: 'right'},
  panUp: {type: 'pan', direction: 'up'},
  panDown: {type: 'pan', direction: 'down'},
  panHorizontal: {type: 'pan', direction: 'horizontal'},
  panVertical: {type: 'pan', direction: 'vertical'},
  swipeLeft: {type: 'swipe', direction: 'left'},
  swipeRight: {type: 'swipe', direction: 'right'},
  swipeUp: {type: 'swipe', direction: 'up'},
  swipeDown: {type: 'swipe', direction: 'down'}
};

function renderLayoutData() {
  if (this._layoutData) {
    var checkedData = Layout.checkConsistency(this._layoutData);
    this._nativeSet('layoutData', Layout.resolveReferences(checkedData, this));
  }
}

function setLayoutProperty(name, value) {
  if (!this._layoutData) {
    this._layoutData = {};
  }
  if (value == null) {
    delete this._layoutData[name];
  } else {
    this._layoutData[name] = value;
  }
  if (this._parent) {
    Layout.addToQueue(this._parent);
  }
}

function getLayoutProperty(name) {
  return this._layoutData && this._layoutData[name] != null ? this._layoutData[name] : null;
}

var Composite = (function (Widget$$1) {
  function Composite () {
    Widget$$1.apply(this, arguments);
  }

  if ( Widget$$1 ) Composite.__proto__ = Widget$$1;
  Composite.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
  Composite.prototype.constructor = Composite;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.Composite';
  };

  Composite.prototype._acceptChild = function _acceptChild () {
    return true;
  };

  Object.defineProperties( Composite.prototype, prototypeAccessors );

  return Composite;
}(Widget));

var ContentView = (function (Composite$$1) {
  function ContentView() {
    if (arguments[0] !== true) {
      throw new Error('ContentView can not be created');
    }
    Composite$$1.call(this);
  }

  if ( Composite$$1 ) ContentView.__proto__ = Composite$$1;
  ContentView.prototype = Object.create( Composite$$1 && Composite$$1.prototype );
  ContentView.prototype.constructor = ContentView;

  ContentView.prototype._create = function _create (type, properties) {
    Composite$$1.prototype._create.call(this, type, properties);
    this._nativeSet('root', true);
  };

  ContentView.prototype._setParent = function _setParent (parent, index) {
    if (this._parent) {
      throw new Error('Parent of ContentView can not be changed');
    }
    Composite$$1.prototype._setParent.call(this, parent, index);
  };

  ContentView.prototype._dispose = function _dispose () {
    throw new Error('ContentView can not be disposed');
  };

  return ContentView;
}(Composite));

function create$3() {
  return new ContentView(true);
}

var StatusBar = (function (Widget$$1) {
  function StatusBar() {
    if (arguments[0] !== true) {
      throw new Error('StatusBar can not be created');
    }
    Widget$$1.call(this);
  }

  if ( Widget$$1 ) StatusBar.__proto__ = Widget$$1;
  StatusBar.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
  StatusBar.prototype.constructor = StatusBar;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.StatusBar';
  };

  StatusBar.prototype._setParent = function _setParent (parent, index) {
    if (this._parent) {
      throw new Error('Parent of StatusBar can not be changed');
    }
    Widget$$1.prototype._setParent.call(this, parent, index);
  };

  StatusBar.prototype._dispose = function _dispose () {
    throw new Error('StatusBar can not be disposed');
  };

  Object.defineProperties( StatusBar.prototype, prototypeAccessors );

  return StatusBar;
}(Widget));

NativeObject.defineProperties(StatusBar.prototype, {
  theme: {type: ['choice', ['default', 'light', 'dark']], default: 'default'},
  displayMode: {type: ['choice', ['default', 'float', 'hide']], default: 'default'},
  height: {
    type: 'number',
    nocache: true,
    readonly: true
  },
  background: {type: 'color', nocache: true}
});

function create$4() {
  return new StatusBar(true);
}

var NavigationBar = (function (Widget$$1) {
  function NavigationBar() {
    if (arguments[0] !== true) {
      throw new Error('NavigationBar can not be created');
    }
    Widget$$1.call(this);
  }

  if ( Widget$$1 ) NavigationBar.__proto__ = Widget$$1;
  NavigationBar.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
  NavigationBar.prototype.constructor = NavigationBar;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.NavigationBar';
  };

  NavigationBar.prototype._setParent = function _setParent (parent, index) {
    if (this._parent) {
      throw new Error('Parent of NavigationBar can not be changed');
    }
    Widget$$1.prototype._setParent.call(this, parent, index);
  };

  NavigationBar.prototype._dispose = function _dispose () {
    throw new Error('NavigationBar can not be disposed');
  };

  Object.defineProperties( NavigationBar.prototype, prototypeAccessors );

  return NavigationBar;
}(Widget));

NativeObject.defineProperties(NavigationBar.prototype, {
  displayMode: {type: ['choice', ['default', 'float', 'hide']], default: 'default'},
  height: {
    type: 'number',
    nocache: true,
    readonly: true
  },
  background: {type: 'color', nocache: true}
});

function create$5() {
  return new NavigationBar(true);
}

var Drawer = (function (Composite$$1) {
  function Drawer() {
    if (arguments[0] !== true) {
      throw new Error('Drawer can not be created');
    }
    Composite$$1.call(this);
  }

  if ( Composite$$1 ) Drawer.__proto__ = Composite$$1;
  Drawer.prototype = Object.create( Composite$$1 && Composite$$1.prototype );
  Drawer.prototype.constructor = Drawer;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.Drawer';
  };

  Drawer.prototype._setParent = function _setParent (parent, index) {
    if (this._parent) {
      throw new Error('Parent of Drawer can not be changed');
    }
    Composite$$1.prototype._setParent.call(this, parent, index);
  };

  Drawer.prototype._listen = function _listen (name, listening) {
    if (name === 'open' || name === 'close') {
      this._nativeListen(name, listening);
    } else {
      Composite$$1.prototype._listen.call(this, name, listening);
    }
  };

  Drawer.prototype._dispose = function _dispose () {
    throw new Error('Drawer can not be disposed');
  };

  Drawer.prototype.open = function open () {
    this._nativeCall('open', {});
    return this;
  };

  Drawer.prototype.close = function close () {
    this._nativeCall('close', {});
    return this;
  };

  Object.defineProperties( Drawer.prototype, prototypeAccessors );

  return Drawer;
}(Composite));

NativeObject.defineProperties(Drawer.prototype, {
  enabled: {
    type: 'boolean',
    default: false
  },
  win_targetView: {
    type: 'proxy'
  },
  win_displayMode: {
    type: ['choice', ['overlay', 'compactOverlay', 'inline', 'compactInline']],
    default: 'overlay'
  }
});

function create$6() {
  return new Drawer(true);
}

var Ui = (function (Composite$$1) {
  function Ui() {
    if (arguments[0] !== true) {
      throw new Error('Ui can not be created');
    }
    Composite$$1.call(this);
    this._appendNamedChild('contentView', create$3());
    this._appendNamedChild('statusBar', create$4());
    this._appendNamedChild('navigationBar', create$5());
    this._appendNamedChild('drawer', create$6());
  }

  if ( Composite$$1 ) Ui.__proto__ = Composite$$1;
  Ui.prototype = Object.create( Composite$$1 && Composite$$1.prototype );
  Ui.prototype.constructor = Ui;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.Ui';
  };

  Ui.prototype._acceptChild = function _acceptChild (child) {
    return child === this.contentView
        || child === this.statusBar
        || child === this.navigationBar
        || child === this.drawer;
  };

  Ui.prototype._appendNamedChild = function _appendNamedChild (name, child) {
    Object.defineProperty(this, name, {value: child});
    this.append(child);
  };

  Ui.prototype._setParent = function _setParent () {
    throw new Error('Parent of tabris.ui can not be changed');
  };

  Ui.prototype._dispose = function _dispose () {
    throw new Error('Ui can not be disposed');
  };

  Object.defineProperties( Ui.prototype, prototypeAccessors );

  return Ui;
}(Composite));

function create$2() {
  return new Ui(true);
}

NativeObject.defineProperties(Ui.prototype, {
  win_theme: {
    type: ['choice', ['default', 'light', 'dark']],
    default: 'light'
  }
});

var ERRORS = {
  EACCES: 'Permission denied',
  EEXIST: 'File exists',
  ENOENT: 'No such file or directory',
  EISDIR: 'Is a directory',
  ENOTDIR: 'Not a directory',
  ENOTEMPTY: 'Directory not empty'
};

var FileSystem = (function (NativeObject$$1) {
  function FileSystem() {
    NativeObject$$1.call(this, 'tabris.FileSystem');
    if (arguments[0] !== true) {
      throw new Error('FileSystem can not be created');
    }
    this._create('tabris.FileSystem');
  }

  if ( NativeObject$$1 ) FileSystem.__proto__ = NativeObject$$1;
  FileSystem.prototype = Object.create( NativeObject$$1 && NativeObject$$1.prototype );
  FileSystem.prototype.constructor = FileSystem;

  var prototypeAccessors = { filesDir: {},cacheDir: {} };

  prototypeAccessors.filesDir.get = function () {
    return this._nativeGet('filesDir');
  };

  prototypeAccessors.cacheDir.get = function () {
    return this._nativeGet('cacheDir');
  };

  FileSystem.prototype.readFile = function readFile (path) {
    var arguments$1 = arguments;
    var this$1 = this;

    return new Promise(function (resolve, reject) {
      if (arguments$1.length < 1) {
        throw new Error('Not enough arguments to readFile');
      }
      this$1._nativeCall('readFile', {
        path: normalizePath$1(path),
        onError: function (err) { return reject(createError(err, path)); },
        onSuccess: function (data) { return resolve(data); }
      });
    });
  };

  FileSystem.prototype.writeFile = function writeFile (path, data) {
    var arguments$1 = arguments;
    var this$1 = this;

    return new Promise(function (resolve, reject) {
      if (arguments$1.length < 2) {
        throw new Error('Not enough arguments to writeFile');
      }
      this$1._nativeCall('writeFile', {
        path: normalizePath$1(path),
        data: checkBuffer(data),
        onError: function (err) { return reject(createError(err, path)); },
        onSuccess: function () { return resolve(); }
      });
    });
  };

  FileSystem.prototype.removeFile = function removeFile (path) {
    var arguments$1 = arguments;
    var this$1 = this;

    return new Promise(function (resolve, reject) {
      if (arguments$1.length < 1) {
        throw new Error('Not enough arguments to removeFile');
      }
      this$1._nativeCall('removeFile', {
        path: normalizePath$1(path),
        onError: function (err) { return reject(createError(err, path)); },
        onSuccess: function () { return resolve(); }
      });
    });
  };

  FileSystem.prototype.dispose = function dispose () {
    throw new Error('Cannot dispose fs object');
  };

  Object.defineProperties( FileSystem.prototype, prototypeAccessors );

  return FileSystem;
}(NativeObject));

function create$7() {
  return new FileSystem(true);
}

function createError(err, path) {
  var message = (ERRORS[err] || err) + ": " + path;
  var code = err in ERRORS ? err : null;
  var error = new Error(message);
  Object.defineProperties(error, {
    path: {value: path},
    code: {value: code}
  });
  return error;
}

function normalizePath$1(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string');
  }
  if (!path.startsWith('/')) {
    throw new Error('Path must be absolute');
  }
  return '/' + path.split(/\/+/).map(function (segment) {
    if (segment === '..') {
      throw new Error("Path must not contain '..'");
    }
    return segment === '.' ? '' : segment;
  }).filter(function (string) { return !!string; }).join('/');
}

function checkBuffer(buffer) {
  if (ArrayBuffer.isView(buffer)) {
    buffer = buffer.buffer;
  }
  if (!(buffer instanceof ArrayBuffer)) {
    throw new Error('Invalid buffer type');
  }
  return buffer;
}

var PHASE_CONSTANTS = {
  NONE: {value: 0},
  CAPTURING_PHASE: {value: 1},
  AT_TARGET: {value: 2},
  BUBBLING_PHASE: {value: 3},
};

var Event = function Event(type, config) {
  if (arguments.length < 1) {
    throw new Error('Not enough arguments to Event');
  }
  this.$timeStamp = Date.now();
  this.$type = type || '';
  this.$bubbles = config && !!config.bubbles || false;
  this.$cancelable = config && !!config.cancelable || false;
  this.$target = null;
  this.$defaultPrevented = false;
};

var prototypeAccessors$3 = { type: {},timeStamp: {},bubbles: {},cancelable: {},target: {},currentTarget: {},defaultPrevented: {},eventPhase: {},isTrusted: {} };

Event.prototype.initEvent = function initEvent (type, bubbles, cancelable) {
  if (arguments.length < 3) {
    throw new Error('Not enough arguments to initEvent');
  }
  this.$type = type + '';
  this.$bubbles = !!bubbles;
  this.$cancelable = !!cancelable;
};

prototypeAccessors$3.type.get = function () {
  return this.$type;
};

prototypeAccessors$3.timeStamp.get = function () {
  return this.$timeStamp;
};

prototypeAccessors$3.bubbles.get = function () {
  return this.$bubbles;
};

prototypeAccessors$3.cancelable.get = function () {
  return this.$cancelable;
};

prototypeAccessors$3.target.get = function () {
  return this.$target;
};

prototypeAccessors$3.currentTarget.get = function () {
  return this.$target;
};

prototypeAccessors$3.defaultPrevented.get = function () {
  return this.$defaultPrevented;
};

prototypeAccessors$3.eventPhase.get = function () {
  return 0;
};

prototypeAccessors$3.isTrusted.get = function () {
  return false;
};

Event.prototype.stopPropagation = function stopPropagation () {
};

Event.prototype.stopImmediatePropagation = function stopImmediatePropagation () {
};

Event.prototype.preventDefault = function preventDefault () {
  if (this.$cancelable) {
    this.$defaultPrevented = true;
  }
};

Object.defineProperties( Event.prototype, prototypeAccessors$3 );

Object.defineProperties(Event, PHASE_CONSTANTS);
Object.defineProperties(Event.prototype, PHASE_CONSTANTS);

function addDOMEventTargetMethods(target) {

  if (typeof target.addEventListener === 'function') {
    return;
  }

  var listeners;

  target.addEventListener = function(type, listener /*, useCapture*/) {
    if (arguments.length < 2) {
      throw new Error('Not enough arguments to addEventListener');
    }
    if (!listeners) {
      listeners = [];
    }
    if (!(type in listeners)) {
      listeners[type] = [];
    }
    if (!listeners[type].includes(listener)) {
      listeners[type].push(listener);
    }
  };

  target.removeEventListener = function(type, listener /*, useCapture*/) {
    if (arguments.length < 2) {
      throw new Error('Not enough arguments to removeEventListener');
    }
    if (listeners && type in listeners) {
      var index = listeners[type].indexOf(listener);
      if (index !== -1) {
        listeners[type].splice(index, 1);
      }
    }
  };

  target.dispatchEvent = function(event) {
    var this$1 = this;

    if (arguments.length < 1) {
      throw new Error('Not enough arguments to dispatchEvent');
    }
    if (!(event instanceof Event)) {
      throw new Error('Invalid event given to dispatchEvent');
    }
    event.$target = target;
    if (listeners && event.type in listeners) {
      for (var i = 0, list = listeners[event.type]; i < list.length; i += 1) {
        var listener = list[i];

        listener.call(this$1, event);
      }
    }
    return !event.defaultPrevented;
  };

}

function defineEventHandlerProperties(target, types) {
  types.forEach(function (type) { return defineEventHandlerProperty(target, type); });
}

function defineEventHandlerProperty(target, type) {
  var handler = 'on' + type;
  var listener = null;
  Object.defineProperty(target, handler, {
    get: function get() {
      return listener;
    },
    set: function set(value) {
      // ignore other types, mimicks the behavior of Firefox and Chromium
      if (typeof value === 'function') {
        if (listener) {
          target.removeEventListener(type, listener);
        }
        listener = value;
        target.addEventListener(type, listener);
      }
    }
  });
}

function addDOMDocument(target) {

  var HTMLElement = function HTMLElement(tagName) {
    this.tagName = (tagName || '').toUpperCase();
    this.children = [];
  };

  HTMLElement.prototype.setAttribute = function setAttribute () {
  };

  HTMLElement.prototype.appendChild = function appendChild (el) {
    this.children.push(el);
    handleElementInserted(this, el, target);
    return el;
  };

  HTMLElement.prototype.cloneNode = function cloneNode () {
    return new HTMLElement();
  };

  HTMLElement.prototype.lastChild = function lastChild () {
    return new HTMLElement();
  };

  target.document = {
    documentElement: {},
    createDocumentFragment: function createDocumentFragment() {return new HTMLElement();},
    createElement: function createElement(tagName) {return new HTMLElement(tagName);},
    location: {href: ''},
    readyState: 'loading',
    head: new HTMLElement('head'),
    getElementsByTagName: function getElementsByTagName(tagName) {
      return this.head.children.filter(function (node) { return node.tagName === tagName.toUpperCase(); });
    },
    createEvent: function createEvent(type) {
      return new Event(type);
    }
  };

  addDOMEventTargetMethods(target.document);
  if (typeof target.location === 'undefined') {
    target.location = target.document.location;
  }

  tabris.once('start', function () {
    target.document.readyState = 'complete';
    var event = new Event('DOMContentLoaded', false, false);
    target.document.dispatchEvent(event);
  });

}

function handleElementInserted(parent, child, target) {
  if (parent.tagName === 'HEAD' && child.tagName === 'SCRIPT' && child.src) {
    var result;
    try {
      result = tabris._client.loadAndExecute(child.src, '', '');
    } catch (ex) {
      console.error('Error loading ' + child.src + ':', ex);
      console.log(ex.stack);
      if (typeof child.onerror === 'function') {
        child.onerror.call(target, ex);
      }
      return;
    }
    if (result.loadError) {
      if (typeof child.onerror === 'function') {
        child.onerror.call(target, new Error('Could not load ' + child.src));
      }
    } else if (typeof child.onload === 'function') {
      child.onload.call(target);
    }
  }
}

var Timer = (function (NativeObject$$1) {
  function Timer(properties) {
    NativeObject$$1.call(this);
    this._create('tabris.Timer', properties);
    this._nativeListen('run', true);
  }

  if ( NativeObject$$1 ) Timer.__proto__ = NativeObject$$1;
  Timer.prototype = Object.create( NativeObject$$1 && NativeObject$$1.prototype );
  Timer.prototype.constructor = Timer;

  return Timer;
}(NativeObject));

NativeObject.defineProperties(Timer.prototype, {delay: 'any', repeat: 'any'});

function addWindowTimerMethods(target) {

  if (typeof target.setTimeout === 'function') {
    return;
  }

  var taskSequence = 0;
  var timers = {};

  function createTimer(fn, delay, repeat, args) {
    var taskId = taskSequence++;
    // If tabris is not ready, create the timer on load.
    // However, clearTimeout won't work until after load.
    var create = function () {
      var timer = new Timer({
        delay: delay,
        repeat: repeat
      }).on('run', function () {
        fn.apply(target, args);
        if (!repeat) {
          timer.dispose();
          delete timers[taskId];
        }
      });
      timer._nativeCall('start');
      timers[taskId] = timer;
    };
    if (tabris.started) {
      create();
    } else {
      tabris.once('start', create);
    }
    return taskId;
  }

  target.setTimeout = function(fn, delay) {
    if (arguments.length < 1) {
      throw new TypeError('Not enough arguments to setTimeout');
    }
    if (typeof fn !== 'function') {
      throw new TypeError('Illegal argument to setTimeout: not a function');
    }
    var args = Array.prototype.slice.call(arguments, 2);
    return createTimer(fn, adjustDelay(delay), false, args);
  };

  target.setInterval = function(fn, delay) {
    if (arguments.length < 1) {
      throw new TypeError('Not enough arguments to setInterval');
    }
    if (typeof fn !== 'function') {
      throw new TypeError('Illegal argument to setInterval: not a function');
    }
    var args = Array.prototype.slice.call(arguments, 2);
    return createTimer(fn, adjustDelay(delay), true, args);
  };

  target.clearTimeout = target.clearInterval = function(taskId) {
    var timer = timers[taskId];
    if (timer) {
      timer._nativeCall('cancel', {});
      timer.dispose();
      delete timers[taskId];
    }
  };

}

function adjustDelay(value) {
  return typeof value === 'number' && isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

var addAnimationFrame = function(target) {
  target.requestAnimationFrame = function (fn) {
    return target.setTimeout(fn, 0);
  };
  target.cancelAnimationFrame = function(timerId) {
    return target.clearTimeout(timerId);
  };
};

var ImageData = (function () {
  function anonymous() {
    if (arguments.length < 2) {
      throw new TypeError('Not enough arguments to ImageData');
    }
    var array, width, height;
    if (arguments[0] instanceof Uint8ClampedArray) {
      array = checkArray(arguments[0]);
      width = checkSize(arguments[1]);
      height = arguments.length > 2 ? checkSize(arguments[2]) : array.byteLength / 4 / width;
      if (array.byteLength !== width * height * 4) {
        throw new Error('Wrong array size');
      }
    } else {
      width = checkSize(arguments[0]);
      height = checkSize(arguments[1]);
      array = new Uint8ClampedArray(width * height * 4);
    }
    Object.defineProperties(this, {
      data: {value: array},
      width: {value: width},
      height: {value: height}
    });
  }

  return anonymous;
}());

function checkArray(array) {
  if (array.byteLength % 4 !== 0) {
    throw new Error('Illegal array length');
  }
  return array;
}

function checkSize(input) {
  var size = Math.floor(input);
  if (size <= 0 || !isFinite(size)) {
    throw new Error('Illegal size for ImageData');
  }
  return size;
}

var OPCODES = {
  arc: 1,
  arcTo: 2,
  beginPath: 3,
  bezierCurveTo: 4,
  clearRect: 5,
  closePath: 6,
  fill: 7,
  fillRect: 8,
  fillStyle: 9,
  fillText: 10,
  lineCap: 11,
  lineJoin: 12,
  lineTo: 13,
  lineWidth: 14,
  moveTo: 15,
  quadraticCurveTo: 16,
  rect: 17,
  restore: 18,
  rotate: 19,
  save: 20,
  scale: 21,
  setTransform: 22,
  stroke: 23,
  strokeRect: 24,
  strokeStyle: 25,
  strokeText: 26,
  textAlign: 27,
  textBaseline: 28,
  transform: 29,
  translate: 30,
};

var GC = (function (NativeObject$$1) {
  function GC(properties) {
    var this$1 = this;

    NativeObject$$1.call(this);
    this._create('tabris.GC', properties);
    this._operations = [];
    this._doubles = [];
    this._booleans = [];
    this._strings = [];
    this._ints = [];
    this._isIOS = tabris.device.platform === 'iOS';
    var listener = function () { return this$1.flush(); };
    tabris.on('flush', listener);
    this.on('dispose', function () { return tabris.off('flush', listener); });
  }

  if ( NativeObject$$1 ) GC.__proto__ = NativeObject$$1;
  GC.prototype = Object.create( NativeObject$$1 && NativeObject$$1.prototype );
  GC.prototype.constructor = GC;

  GC.prototype.init = function init (properties) {
    this._nativeCall('init', properties);
  };

  GC.prototype.getImageData = function getImageData (x, y, width, height) {
    var array = this._nativeCall('getImageData', {x: x, y: y, width: width, height: height});
    // TODO: remove when iOS returns a typed array
    return array instanceof Uint8ClampedArray ? array : new Uint8ClampedArray(array);
  };

  GC.prototype.putImageData = function putImageData (imageData, x, y) {
    this._nativeCall('putImageData', {
      data: imageData.data,
      width: imageData.width,
      height: imageData.height,
      x: x,
      y: y
    });
  };

  GC.prototype.addOperation = function addOperation (operation) {
    if (this._isIOS) {
      this._operations.push([operation]);
    } else {
      var opCode = OPCODES[operation];
      if (!opCode) {
        throw new Error('Invalid operation');
      }
      this._operations.push(opCode);
    }
  };

  GC.prototype.addBoolean = function addBoolean () {
    var array = this._isIOS ? this._operations[this._operations.length - 1] : this._booleans;
    Array.prototype.push.apply(array, arguments);
  };

  GC.prototype.addDouble = function addDouble () {
    var array = this._isIOS ? this._operations[this._operations.length - 1] : this._doubles;
    Array.prototype.push.apply(array, arguments);
  };

  GC.prototype.addInt = function addInt () {
    var array = this._isIOS ? this._operations[this._operations.length - 1] : this._ints;
    Array.prototype.push.apply(array, arguments);
  };

  GC.prototype.addString = function addString () {
    var array = this._isIOS ? this._operations[this._operations.length - 1] : this._strings;
    Array.prototype.push.apply(array, arguments);
  };

  GC.prototype.flush = function flush () {
    if (this._operations.length > 0) {
      if (this._isIOS) {
        this._nativeCall('draw', {operations: this._operations});
      } else {
        this._nativeCall('draw', {packedOperations: [
          this._operations,
          this._doubles,
          this._booleans,
          this._strings,
          this._ints
        ]});
      }
      this._operations = [];
      this._doubles = [];
      this._booleans = [];
      this._strings = [];
      this._ints = [];
    }
  };

  return GC;
}(NativeObject));

NativeObject.defineProperties(GC.prototype, {parent: 'proxy'});

var CanvasContext = function CanvasContext(gc) {
  var this$1 = this;

  this._gc = gc;
  this._state = createState();
  this._savedStates = [];
  this.canvas = {
    width: 0,
    height: 0,
    style: {}
  };
  for (var name in properties) {
    defineProperty(this$1, name);
  }
};

CanvasContext.prototype.measureText = function measureText (text) {
  // TODO: delegate to native function, once it is implemented (#56)
  return {width: text.length * 5 + 5};
};

// ImageData operations

CanvasContext.prototype.getImageData = function getImageData (x, y, width, height) {
  checkRequiredArgs(arguments, 4, 'CanvasContext.getImageData');
  this._gc.flush();
  // TODO check validity of args
  var array = this._gc.getImageData(x, y, width, height);
  return new ImageData(array, width, height);
};

CanvasContext.prototype.putImageData = function putImageData (imageData, x, y) {
  checkRequiredArgs(arguments, 3, 'CanvasContext.putImageData');
  this._gc.flush();
  this._gc.putImageData(imageData, x, y);
};

CanvasContext.prototype.createImageData = function createImageData (width, height) {
  if (arguments[0] instanceof ImageData) {
    var data = arguments[0];
    width = data.width;
    height = data.height;
  } else {
    checkRequiredArgs(arguments, 2, 'CanvasContext.createImageData');
  }
  return new ImageData(width, height);
};

CanvasContext.prototype._init = function _init (width, height) {
  this.canvas.width = width;
  this.canvas.height = height;
  this._gc.init({
    width: width,
    height: height,
    font: [['sans-serif'], 12, false, false],
    fillStyle: [0, 0, 0, 255],
    strokeStyle: [0, 0, 0, 255]
  });
};

// State operations

defineMethod('save', 0, function() {
  this._savedStates.push(Object.assign({}, this._state));
});

defineMethod('restore', 0, function() {
  this._state = this._savedStates.pop() || this._state;
});

// Path operations

defineMethod('beginPath');

defineMethod('closePath');

defineMethod('lineTo', 2, function(x, y) {
  this._gc.addDouble(x, y);
});

defineMethod('moveTo', 2, function(x, y) {
  this._gc.addDouble(x, y);
});

defineMethod('bezierCurveTo', 6, function(cp1x, cp1y, cp2x, cp2y, x, y) {
  this._gc.addDouble(cp1x, cp1y, cp2x, cp2y, x, y);
});

defineMethod('quadraticCurveTo', 4, function(cpx, cpy, x, y) {
  this._gc.addDouble(cpx, cpy, x, y);
});

defineMethod('rect', 4, function(x, y, width, height) {
  this._gc.addDouble(x, y, width, height);
});

defineMethod('arc', 5, function(x, y, radius, startAngle, endAngle, anticlockwise) {
  this._gc.addDouble(x, y, radius, startAngle, endAngle);
  this._gc.addBoolean(!!anticlockwise);
});

defineMethod('arcTo', 5, function(x1, y1, x2, y2, radius) {
  this._gc.addDouble(x1, y1, x2, y2, radius);
});

// Transformations

defineMethod('scale', 2, function(x, y) {
  this._gc.addDouble(x, y);
});

defineMethod('rotate', 1, function(angle) {
  this._gc.addDouble(angle);
});

defineMethod('translate', 2, function(x, y) {
  this._gc.addDouble(x, y);
});

defineMethod('transform', 6, function(a, b, c, d, e, f) {
  this._gc.addDouble(a, b, c, d, e, f);
});

defineMethod('setTransform', 6, function(a, b, c, d, e, f) {
  this._gc.addDouble(a, b, c, d, e, f);
});

// Drawing operations

defineMethod('clearRect', 4, function(x, y, width, height) {
  this._gc.addDouble(x, y, width, height);
});

defineMethod('fillRect', 4, function(x, y, width, height) {
  this._gc.addDouble(x, y, width, height);
});

defineMethod('strokeRect', 4, function(x, y, width, height) {
  this._gc.addDouble(x, y, width, height);
});

defineMethod('fillText', 3, function(text, x, y /* , maxWidth */) {
  this._gc.addString(text);
  this._gc.addBoolean(false, false, false);
  this._gc.addDouble(x, y);
});

defineMethod('strokeText', 3, function(text, x, y /* , maxWidth */) {
  this._gc.addString(text);
  this._gc.addBoolean(false, false, false);
  this._gc.addDouble(x, y);
});

defineMethod('fill');

defineMethod('stroke');

CanvasContext.getContext = function(canvas, width, height) {
  if (!canvas._gc) {
    canvas._gc = new GC({parent: canvas});
  }
  if (!canvas._ctx) {
    canvas._ctx = new CanvasContext(canvas._gc);
  }
  canvas._ctx._init(width, height);
  return canvas._ctx;
};

var properties = {
  lineWidth: {
    init: 1,
    encode: function encode(value) {
      if (value > 0) {
        return value;
      }
      throw new Error(value);
    },
    decode: passThrough,
    addOperations: function addOperations(value) {
      this._gc.addDouble(value);
    }
  },
  lineCap: {
    init: 'butt',
    values: toObject(['butt', 'round', 'square']),
    encode: checkValue$1,
    decode: passThrough,
    addOperations: function addOperations(value) {
      this._gc.addString(value);
    }
  },
  lineJoin: {
    init: 'miter',
    values: toObject(['bevel', 'miter', 'round']),
    encode: checkValue$1,
    decode: passThrough,
    addOperations: function addOperations(value) {
      this._gc.addString(value);
    }
  },
  fillStyle: {
    init: [0, 0, 0, 255],
    encode: colorStringToArray,
    decode: colorArrayToString,
    addOperations: function addOperations(value) {
      this._gc.addInt(value[0], value[1], value[2], value[3]);
    }
  },
  strokeStyle: {
    init: [0, 0, 0, 255],
    encode: colorStringToArray,
    decode: colorArrayToString,
    addOperations: function addOperations(value) {
      this._gc.addInt(value[0], value[1], value[2], value[3]);
    }
  },
  textAlign: {
    init: 'start',
    values: toObject(['start', 'end', 'left', 'right', 'center']),
    encode: checkValue$1,
    decode: passThrough,
    addOperations: function addOperations(value) {
      this._gc.addString(value);
    }
  },
  textBaseline: {
    init: 'alphabetic',
    values: toObject(['top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom']),
    encode: checkValue$1,
    decode: passThrough,
    addOperations: function addOperations(value) {
      this._gc.addString(value);
    }
  }
};

function passThrough(value) {
  return value;
}

function checkValue$1(value) {
  if (value in this.values) {
    return value;
  }
  throw new Error(value);
}

function toObject(array) {
  var obj = {};
  array.forEach(function (name) {
    obj[name] = true;
  });
  return obj;
}

function createState() {
  var state = {};
  for (var name in properties) {
    state[name] = properties[name].init;
  }
  return state;
}

function defineMethod(name, reqArgCount, fn) {
  CanvasContext.prototype[name] = function() {
    checkRequiredArgs(arguments, reqArgCount, 'CanvasContext.' + name);
    this._gc.addOperation(name);
    if (fn) {
      fn.apply(this, arguments);
    }
  };
}

function defineProperty(context, name) {
  var prop = properties[name];
  Object.defineProperty(context, name, {
    get: function get() {
      return prop.decode(context._state[name]);
    },
    set: function set(value) {
      try {
        context._state[name] = prop.encode(value);
        context._gc.addOperation(name);
        prop.addOperations.call(context, context._state[name]);
      } catch (error) {
        console.warn('Unsupported value for ' + name + ': ' + value);
      }
    }
  });
}

function checkRequiredArgs(args, nr, name) {
  if (args.length < nr) {
    throw new Error('Not enough arguments to ' + name);
  }
}

var Canvas = (function (Composite$$1) {
  function Canvas () {
    Composite$$1.apply(this, arguments);
  }

  if ( Composite$$1 ) Canvas.__proto__ = Composite$$1;
  Canvas.prototype = Object.create( Composite$$1 && Composite$$1.prototype );
  Canvas.prototype.constructor = Canvas;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.Canvas';
  };

  Canvas.prototype.getContext = function getContext (type, width, height) {
    if (type === '2d') {
      return CanvasContext.getContext(this, width, height);
    }
    return null;
  };

  Object.defineProperties( Canvas.prototype, prototypeAccessors );

  return Canvas;
}(Composite));

//import dummyDoc from './dummyDoc';

var Path2D = Path2D || (function () {
  function Path2D() {
    console.log('It is fake Path2D constructor');
  }

  return Path2D;
}());

var addSVGSupport = function(target) {
  target.SVGPath = function (ref) {
    var d = ref.d;
    var width = ref.width; if ( width === void 0 ) width = 100;
    var height = ref.height; if ( height === void 0 ) height = 100;
    var top = ref.top; if ( top === void 0 ) top = 0;
    var left = ref.left; if ( left === void 0 ) left = 0;
    var right = ref.right; if ( right === void 0 ) right = 0;
    var bottom = ref.bottom; if ( bottom === void 0 ) bottom = 0;

    if (typeof Path2D === 'undefined') {
      console.log('Warn: Path2D is not available');
      return;
    }
    return new Canvas({top: top, left: left, width: width, height: height, right: right, bottom: bottom})
      .on('resize', function () {
        return new Path2D(d);
      });
  };
};

var ClientStore = (function (NativeObject$$1) {
  function ClientStore() {
    NativeObject$$1.call(this, 'tabris.ClientStore');
    this._create('tabris.ClientStore');
  }

  if ( NativeObject$$1 ) ClientStore.__proto__ = NativeObject$$1;
  ClientStore.prototype = Object.create( NativeObject$$1 && NativeObject$$1.prototype );
  ClientStore.prototype.constructor = ClientStore;

  return ClientStore;
}(NativeObject));

var SecureStore = (function (NativeObject$$1) {
  function SecureStore() {
    NativeObject$$1.call(this, 'tabris.SecureStore');
    this._create('tabris.SecureStore');
  }

  if ( NativeObject$$1 ) SecureStore.__proto__ = NativeObject$$1;
  SecureStore.prototype = Object.create( NativeObject$$1 && NativeObject$$1.prototype );
  SecureStore.prototype.constructor = SecureStore;

  return SecureStore;
}(NativeObject));

var encode = types.string.encode;

var Storage = function Storage() {
  var proxy = arguments[0];
  if (!(proxy instanceof NativeObject)) {
    throw new Error('Cannot instantiate Storage');
  }
  Object.defineProperty(this, '_proxy', {value: proxy});
};

// Note: key and length methods currently not supported

Storage.prototype.setItem = function setItem (key, value) {
  if (arguments.length < 2) {
    throw new TypeError("Not enough arguments to 'setItem'");
  }
  this._proxy._nativeCall('add', {
    key: encode(key),
    value: encode(value)
  });
};

Storage.prototype.getItem = function getItem (key) {
  if (arguments.length < 1) {
    throw new TypeError("Not enough arguments to 'getItem'");
  }
  var result = this._proxy._nativeCall('get', {key: encode(key)});
  // Note: iOS can not return null, only undefined:
  return result === undefined ? null : result;
};

Storage.prototype.removeItem = function removeItem (key) {
  if (arguments.length < 1) {
    throw new TypeError("Not enough arguments to 'removeItem'");
  }
  this._proxy._nativeCall('remove', {keys: [encode(key)]});
};

Storage.prototype.clear = function clear () {
  this._proxy._nativeCall('clear');
};

function create$8(secure) {
  var proxy = secure ? new SecureStore() : new ClientStore();
  return new Storage(proxy);
}

var ConvertizeMap = {
  color: 'textColor',
  align: 'alignment'
};

var CSSParser = function CSSParser(fileOrText) {
  if (typeof fileOrText === 'string') {
    if (fileOrText.includes('{') && fileOrText.includes('}')) {
      this.css = JSON.parse(fileOrText);
    } else {
      this.css = JSON.parse(require(fileOrText));
    }
  }
};
CSSParser.prototype.convertTo = function convertTo () {
    var this$1 = this;

  Object.keys(this.css)
    .map(function (key) {
      if (ConvertizeMap[key]) {
        this$1.css[ConvertizeMap[key]] = this$1.css[key];
        delete this$1.css[key];
      }
    });
  return this.css;
};

var Styles = function(input) {
  return new CSSParser(input)
    .convertTo();
};

function createElement(jsxType, properties) {
  var children = [], len = arguments.length - 2;
  while ( len-- > 0 ) children[ len ] = arguments[ len + 2 ];

  var Type = typeToConstructor(jsxType);
  var on = {}, once = {}, style;
  for (var ev in properties) {
    if (ev.indexOf('once-') > -1) {
      once[ev.substr(5)] = properties[ev];
      delete properties[ev];
    } else if (ev.indexOf('on-') > -1) {
      on[ev.substr(3)] = properties[ev];
      delete properties[ev];
    } else if (ev === 'style') {
      style = Styles(properties[ev]);
      delete properties[ev];
    }
  }
  var result = new Type(properties);
  for (var ev$1 in on) {
    result.on(ev$1, on[ev$1]);
  }
  for (var ev$2 in once) {
    result.once(ev$2, once[ev$2]);
  }
  if (style) {
    result.set(style);
  }
  if (!(result instanceof Widget)) {
    throw new Error(('JSX: Unsupported type ' + Type.name).trim());
	return;
  }
  return result.append.apply(result, children);
}

function typeToConstructor(jsxType) {
  if (jsxType instanceof Function) {
    return jsxType;
  }
  var typeName = jsxType.charAt(0).toUpperCase() + jsxType.slice(1);
  var Type =  global.tabris[typeName];
  if (!(Type instanceof Function)) {
    throw new Error(('JSX: Unsupported type ' + jsxType).trim());
  }
  return Type;
}


var JSX = Object.freeze({
	createElement: createElement
});

var Action = (function (Widget$$1) {
  function Action () {
    Widget$$1.apply(this, arguments);
  }

  if ( Widget$$1 ) Action.__proto__ = Widget$$1;
  Action.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
  Action.prototype.constructor = Action;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.Action';
  };

  Action.prototype._listen = function _listen (name, listening) {
    if (name === 'select') {
      this._nativeListen(name, listening);
    } else {
      Widget$$1.prototype._listen.call(this, name, listening);
    }
  };

  Object.defineProperties( Action.prototype, prototypeAccessors );

  return Action;
}(Widget));

NativeObject.defineProperties(Action.prototype, {
  image: {type: 'image', default: null},
  placementPriority: {
    type: ['choice', ['low', 'high', 'normal']],
    set: function set(name, value) {
      this._nativeSet(name, value.toUpperCase());
      this._storeProperty(name, value);
    },
    default: 'normal'
  },
  title: {type: 'string', default: ''},
  win_symbol: {type: 'string', default: ''}
});

var ActivityIndicator = (function (Widget$$1) {
  function ActivityIndicator () {
    Widget$$1.apply(this, arguments);
  }

  if ( Widget$$1 ) ActivityIndicator.__proto__ = Widget$$1;
  ActivityIndicator.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
  ActivityIndicator.prototype.constructor = ActivityIndicator;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.ActivityIndicator';
  };

  Object.defineProperties( ActivityIndicator.prototype, prototypeAccessors );

  return ActivityIndicator;
}(Widget));

var AlertDialog = (function (NativeObject$$1) {
  function AlertDialog(properties) {
    NativeObject$$1.call(this);
    this._create('tabris.AlertDialog', properties);
    this._nativeListen('close', true);
  }

  if ( NativeObject$$1 ) AlertDialog.__proto__ = NativeObject$$1;
  AlertDialog.prototype = Object.create( NativeObject$$1 && NativeObject$$1.prototype );
  AlertDialog.prototype.constructor = AlertDialog;

  AlertDialog.prototype._trigger = function _trigger (name, event) {
    if (name === 'close') {
      event.button = event.button || '';
      if (event.button) {
        NativeObject$$1.prototype._trigger.call(this, 'close' + capitalizeFirstChar(event.button), event);
      }
      NativeObject$$1.prototype._trigger.call(this, 'close', event);
      this.dispose();
    } else {
      return NativeObject$$1.prototype._trigger.call(this, name, event);
    }
  };

  AlertDialog.prototype.open = function open () {
    if (this.isDisposed()) {
      throw new Error('Can not open a dialog that was closed');
    }
    this._nativeCall('open');
    return this;
  };

  AlertDialog.prototype.close = function close () {
    this.dispose();
    return this;
  };

  return AlertDialog;
}(NativeObject));

NativeObject.defineProperties(AlertDialog.prototype, {
  title: {type: 'string', default: ''},
  message: {type: 'string', default: ''},
  buttons: {
    type: {
      encode: function encode(value) {
        if (typeof value !== 'object') {
          throw new Error('value is not an object');
        }
        var encoded = {};
        if ('ok' in value) {
          encoded.ok = value.ok + '';
        }
        if ('cancel' in value) {
          encoded.cancel = value.cancel + '';
        }
        if ('neutral' in value) {
          encoded.neutral = value.neutral + '';
        }
        return encoded;
      }
    },
    default: function () { return ({}); }
  }
});

var Button = (function (Widget$$1) {
  function Button () {
    Widget$$1.apply(this, arguments);
  }

  if ( Widget$$1 ) Button.__proto__ = Widget$$1;
  Button.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
  Button.prototype.constructor = Button;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.Button';
  };

  Button.prototype._listen = function _listen (name, listening) {
    if (name === 'select') {
      this._nativeListen(name, listening);
    } else {
      Widget$$1.prototype._listen.call(this, name, listening);
    }
  };

  Object.defineProperties( Button.prototype, prototypeAccessors );

  return Button;
}(Widget));

NativeObject.defineProperties(Button.prototype, {
  alignment: {type: ['choice', ['left', 'right', 'center']], default: 'center'},
  image: {type: 'image', default: null},
  text: {type: 'string', default: ''},
  textColor: {type: 'color'}
});

var CheckBox = (function (Widget$$1) {
  function CheckBox () {
    Widget$$1.apply(this, arguments);
  }

  if ( Widget$$1 ) CheckBox.__proto__ = Widget$$1;
  CheckBox.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
  CheckBox.prototype.constructor = CheckBox;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.CheckBox';
  };

  CheckBox.prototype._listen = function _listen (name, listening) {
    if (name === 'checkedChanged') {
      this._onoff('select', listening, this.$triggerChangeChecked);
    } else if (name === 'select') {
      this._nativeListen(name, listening);
    } else {
      Widget$$1.prototype._listen.call(this, name, listening);
    }
  };

  CheckBox.prototype.$triggerChangeChecked = function $triggerChangeChecked (ref) {
    var checked = ref.checked;

    this._triggerChangeEvent('checked', checked);
  };

  Object.defineProperties( CheckBox.prototype, prototypeAccessors );

  return CheckBox;
}(Widget));

NativeObject.defineProperties(CheckBox.prototype, {
  text: {type: 'string', default: ''},
  checked: {type: 'boolean', nocache: true},
  textColor: {type: 'color'}
});

var EVENT_TYPES$2 = ['refresh', 'select', 'scroll'];

var CollectionView = (function (Composite$$1) {
  function CollectionView(properties) {
    var this$1 = this;

    Composite$$1.call(this, properties);
    this._nativeListen('requestInfo', true);
    this._nativeListen('createCell', true);
    this._nativeListen('updateCell', true);
    tabris.on('flush', this._flush, this);
    this.on('dispose', function () { return tabris.off('flush', this$1._flush, this$1); });
  }

  if ( Composite$$1 ) CollectionView.__proto__ = Composite$$1;
  CollectionView.prototype = Object.create( Composite$$1 && Composite$$1.prototype );
  CollectionView.prototype.constructor = CollectionView;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.CollectionView';
  };

  CollectionView.prototype.load = function load (itemCount) {
    if (!isNumber$1(itemCount) || itemCount < 0) {
      throw new Error('Invalid itemCount');
    }
    this._storeProperty('itemCount', itemCount);
    this._nativeCall('load', {itemCount: itemCount});
  };

  CollectionView.prototype.reveal = function reveal (index) {
    index = this._checkIndex(index);
    if (index >= 0 && index < this.itemCount) {
      this._flush();
      this._nativeCall('reveal', {index: index});
    }
  };

  CollectionView.prototype.refresh = function refresh (index) {
    if (arguments.length === 0) {
      this._flush();
      this._nativeCall('refresh', {index: 0, count: this.itemCount});
      return;
    }
    index = this._checkIndex(index);
    if (index >= 0 && index < this.itemCount) {
      this._flush();
      this._nativeCall('refresh', {index: index, count: 1});
    }
  };

  CollectionView.prototype.insert = function insert (index, count) {
    if ( count === void 0 ) count = 1;

    index = Math.min(Math.max(0, this._checkIndex(index)), this.itemCount);
    if (!isNumber$1(count) || count <= 0) {
      throw new Error('Invalid insert count');
    }
    this._storeProperty('itemCount', this.itemCount + count);
    this._flush();
    this._nativeCall('insert', {index: index, count: count});
  };

  CollectionView.prototype.remove = function remove (index, count) {
    if ( count === void 0 ) count = 1;

    index = this._checkIndex(index);
    if (isNumber$1(count) && count >= 0) {
      count = Math.min(count, this.itemCount - index);
    } else {
      throw new Error('Invalid remove count');
    }
    if (index >= 0 && index < this.itemCount && count > 0) {
      this._storeProperty('itemCount', this.itemCount - count);
      this._flush();
      this._nativeCall('remove', {index: index, count: count});
    }
  };

  CollectionView.prototype._flush = function _flush () {
    // Load new items if needed after all properties have been set
    // to avoid intercepting the aggregation of properties in set.
    if (this._needsReload) {
      delete this._needsReload;
      this._nativeCall('load', {itemCount: this.itemCount});
    }
  };

  CollectionView.prototype._checkIndex = function _checkIndex (index) {
    if (!isNumber$1(index)) {
      throw new Error('Invalid index');
    }
    return index < 0 ? index + this.itemCount : index;
  };

  CollectionView.prototype._listen = function _listen (name, listening) {
    if (name === 'firstVisibleIndexChanged') {
      this._onoff('scroll', listening, triggerChangeFirstVisibleIndex);
    } else if (name === 'lastVisibleIndexChanged') {
      this._onoff('scroll', listening, triggerChangeLastVisibleIndex);
    } else if (EVENT_TYPES$2.includes(name)) {
      this._nativeListen(name, listening);
    } else {
      Composite$$1.prototype._listen.call(this, name, listening);
    }
  };

  CollectionView.prototype._trigger = function _trigger (name, event) {
    if (name === 'requestInfo') {
      var type = resolveProperty(this, 'cellType', event.index);
      var height = resolveProperty(this, 'cellHeight', event.index, type);
      return {
        type: encodeCellType(this, type),
        height: encodeCellHeight(height)
      };
    } else if (name === 'createCell') {
      var item = this._createCell(event.type);
      return item.cid;
    } else if (name === 'updateCell') {
      this.updateCell(tabris._proxies.find(event.widget), event.index);
    } else if (name === 'select') {
      return Composite$$1.prototype._trigger.call(this, 'select', {index: event.index});
    } else {
      return Composite$$1.prototype._trigger.call(this, name, event);
    }
  };

  CollectionView.prototype._createCell = function _createCell (type) {
    var cell = this.createCell(decodeCellType(this, type));
    if (!(cell instanceof Widget)) {
      throw new Error('Created cell is not a widget');
    }
    if (cell._parent) {
      throw new Error('Created cell already has a parent');
    }
    cell._parent = this;
    this._addChild(cell);
    cell._setParent = function () { return console.warn('Cannot re-parent collection view cell'); };
    cell.dispose = function () { return console.warn('Cannot dispose of collection view cell'); };
    return cell;
  };

  Object.defineProperties( CollectionView.prototype, prototypeAccessors );

  return CollectionView;
}(Composite));

NativeObject.defineProperties(CollectionView.prototype, {
  itemCount: {
    type: 'natural',
    default: 0,
    set: function set(name, value) {
      this._storeProperty(name, value);
      this._needsReload = true;
    }
  },
  cellType: {
    type: 'any', // string|function,
    default: null,
    set: function set(name, value) {
      if (value !== this.cellType) {
        this._storeProperty(name, value);
        this._needsReload = true;
      }
    }
  },
  cellHeight: {
    type: 'any', // natural|auto|function
    default: 'auto',
    set: function set(name, value) {
      if (value !== this.cellHeight) {
        this._storeProperty(name, value);
        this._needsReload = true;
      }
    }
  },
  createCell: {
    type: 'function',
    default: function () { return function () { return new Composite(); }; },
    set: function set(name, value) {
      if (value !== this.createCell) {
        this._storeProperty(name, value);
        this._needsReload = true;
      }
    }
  },
  updateCell: {
    type: 'function',
    default: function () { return function () {}; },
    set: function set(name, value) {
      if (value !== this.updateCell) {
        this._storeProperty(name, value);
        this._needsReload = true;
      }
    }
  },
  refreshEnabled: {
    type: 'boolean',
    default: false
  },
  refreshIndicator: {
    type: 'boolean',
    nocache: true
  },
  refreshMessage: {
    type: 'string',
    default: ''
  },
  firstVisibleIndex: {
    type: 'number',
    readonly: true
  },
  lastVisibleIndex: {
    type: 'number',
    readonly: true
  },
  columnCount: {
    type: 'number',
    default: 1
  }
});

function resolveProperty(ctx, name) {
  var value = ctx[name];
  if (typeof value === 'function') {
    return value.apply(null, Array.prototype.slice.call(arguments, 2));
  }
  return value;
}

function encodeCellType(ctx, type) {
  var cellTypes = ctx._cellTypes || (ctx._cellTypes = []);
  var index = cellTypes.indexOf(type);
  if (index === -1) {
    index += cellTypes.push(type);
  }
  return index;
}

function decodeCellType(ctx, type) {
  var cellTypes = ctx._cellTypes || [];
  return cellTypes[type] || null;
}

function encodeCellHeight(value) {
  if (value === 'auto') {
    return -1;
  }
  if (isNumber$1(value)) {
    return Math.max(-1, value);
  }
  console.warn('Invalid cell height: ' + value);
}

var triggerChangeFirstVisibleIndex = createDelegate('firstVisibleIndex');
var triggerChangeLastVisibleIndex = createDelegate('lastVisibleIndex');

function createDelegate(prop) {
  return function() {
    var actual = this.get(prop);
    if (actual !== this['_prev:' + prop]) {
      this._triggerChangeEvent(prop, actual);
    }
    this['_prev:' + prop] = actual;
  };
}

function isNumber$1(value) {
  return typeof value === 'number' && isFinite(value);
}

var Component = (function (Widget$$1) {
  function Component (props) {
    if ( props === void 0 ) props = {};

    Widget$$1.call(this);
    this.props = props;
    this.state = {};
    this.setState = this.setState.bind(this);
  }

  if ( Widget$$1 ) Component.__proto__ = Widget$$1;
  Component.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
  Component.prototype.constructor = Component;
  Component.prototype.run = function run () {
    this._release();
    this.append(this.render());
    return this;
  };
  Component.prototype.setState = function setState (fn) {
    this._release();
    this.state = fn(this.state);
    this.append(this.render());
    return this;
  };
  Component.prototype.render = function render () {};

  return Component;
}(Widget));

var Crypto = (function (NativeObject$$1) {
  function Crypto() {
    NativeObject$$1.call(this);
    this._create('tabris.Crypto');
  }

  if ( NativeObject$$1 ) Crypto.__proto__ = NativeObject$$1;
  Crypto.prototype = Object.create( NativeObject$$1 && NativeObject$$1.prototype );
  Crypto.prototype.constructor = Crypto;

  Crypto.prototype.getRandomValues = function getRandomValues (typedArray) {
    if (arguments.length === 0) {
      throw new Error('Not enough arguments to Crypto.getRandomValues');
    }
    if (!isIntArray(typedArray)) {
      throw new Error('Unsupported type in Crypto.getRandomValues');
    }
    var byteLength = typedArray.byteLength;
    var values = this._nativeCall('getRandomValues', {byteLength: byteLength});
    if (values.length !== byteLength) {
      throw new Error('Not enough random bytes available');
    }
    new Uint8Array(typedArray.buffer).set(values);
  };

  return Crypto;
}(NativeObject));

function isIntArray(value) {
  return (value instanceof Int8Array) ||
         (value instanceof Uint8Array) ||
         (value instanceof Uint8ClampedArray) ||
         (value instanceof Int16Array) ||
         (value instanceof Uint16Array) ||
         (value instanceof Int32Array) ||
         (value instanceof Uint32Array);
}

var ImageView = (function (Widget$$1) {
  function ImageView () {
    Widget$$1.apply(this, arguments);
  }

  if ( Widget$$1 ) ImageView.__proto__ = Widget$$1;
  ImageView.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
  ImageView.prototype.constructor = ImageView;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.ImageView';
  };

  ImageView.prototype._listen = function _listen (name, listening) {
    if (name === 'load') {
      this._nativeListen(name, listening);
    } else {
      Widget$$1.prototype._listen.call(this, name, listening);
    }
  };

  Object.defineProperties( ImageView.prototype, prototypeAccessors );

  return ImageView;
}(Widget));

NativeObject.defineProperties(ImageView.prototype, {
  image: {type: 'image', default: null},
  scaleMode: {type: ['choice', ['auto', 'fit', 'fill', 'stretch', 'none']], default: 'auto'},
  tintColor: {
    type: 'color',
    set: function set(name, value) {
      this._nativeSet(name, value === undefined ? null : value);
      this._storeProperty(name, value);
    }
  }
});

var InactivityTimer = (function (NativeObject$$1) {
  function InactivityTimer(properties) {
    NativeObject$$1.call(this);
    this._create('tabris.InactivityTimer', properties);
    this._nativeListen('timeout', true);
  }

  if ( NativeObject$$1 ) InactivityTimer.__proto__ = NativeObject$$1;
  InactivityTimer.prototype = Object.create( NativeObject$$1 && NativeObject$$1.prototype );
  InactivityTimer.prototype.constructor = InactivityTimer;

  InactivityTimer.prototype.start = function start () {
    this._nativeCall('start');
  };

  InactivityTimer.prototype.cancel = function cancel () {
    this._nativeCall('cancel');
  };

  return InactivityTimer;
}(NativeObject));

NativeObject.defineProperties(InactivityTimer.prototype, {
  delay: {
    type: 'natural',
    default: 0
  }
});

var EVENT_TYPES$3 = ['input', 'accept', 'select'];

var SearchAction = (function (Widget$$1) {
  function SearchAction () {
    Widget$$1.apply(this, arguments);
  }

  if ( Widget$$1 ) SearchAction.__proto__ = Widget$$1;
  SearchAction.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
  SearchAction.prototype.constructor = SearchAction;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.SearchAction';
  };

  SearchAction.prototype._listen = function _listen (name, listening) {
    if (EVENT_TYPES$3.includes(name)) {
      this._nativeListen(name, listening);
    } else {
      Widget$$1.prototype._listen.call(this, name, listening);
    }
  };

  SearchAction.prototype.open = function open () {
    this._nativeCall('open', {});
    return this;
  };

  Object.defineProperties( SearchAction.prototype, prototypeAccessors );

  return SearchAction;
}(Widget));

NativeObject.defineProperties(SearchAction.prototype, {
  image: {type: 'image', default: null},
  placementPriority: {type: ['choice', ['low', 'high', 'normal']], default: 'normal'},
  title: {type: 'string', default: ''},
  proposals: {default: function default$1() {return [];}},
  text: {type: 'string', nocache: true},
  message: {type: 'string', default: ''}
});

var NavigationView = (function (Composite$$1) {
  function NavigationView(properties) {
    Composite$$1.call(this, properties);
    this._nativeListen('backNavigation', true);
  }

  if ( Composite$$1 ) NavigationView.__proto__ = Composite$$1;
  NavigationView.prototype = Object.create( Composite$$1 && Composite$$1.prototype );
  NavigationView.prototype.constructor = NavigationView;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.NavigationView';
  };

  NavigationView.prototype._acceptChild = function _acceptChild (child) {
    return child instanceof Page || child instanceof Action || child instanceof SearchAction;
  };

  NavigationView.prototype._addChild = function _addChild (child, index) {
    var isTopPage = (child instanceof Page && typeof index !== 'number' || index === this.pages().length);
    if (isTopPage) {
      this._triggerDisappear();
    }
    Composite$$1.prototype._addChild.call(this, child, index);
    if (isTopPage) {
      this._triggerAppear();
    }
  };

  NavigationView.prototype._removeChild = function _removeChild (child) {
    var isTopPage = (child instanceof Page && child === this.pages().last());
    if (isTopPage) {
      this._triggerDisappear();
    }
    Composite$$1.prototype._removeChild.call(this, child);
    if (isTopPage) {
      this._triggerAppear();
    }
  };

  NavigationView.prototype._handleBackNavigation = function _handleBackNavigation () {
    this._pop(this.pages().last());
  };

  NavigationView.prototype._pop = function _pop (page) {
    if (page && page.autoDispose) {
      page.dispose();
    } else if (page) {
      page._setParent(null);
    }
  };

  NavigationView.prototype._listen = function _listen (name, listening) {
    if (name === 'topToolbarHeightChanged' || name === 'bottomToolbarHeightChanged') {
      this._nativeListen(name, listening);
    } else {
      Composite$$1.prototype._listen.call(this, name, listening);
    }
  };

  NavigationView.prototype._trigger = function _trigger (name, event) {
    if (name === 'backNavigation') {
      this._handleBackNavigation();
    } else if (name === 'topToolbarHeightChanged') {
      this._triggerChangeEvent('topToolbarHeight', event.topToolbarHeight);
    } else if (name === 'bottomToolbarHeightChanged') {
      this._triggerChangeEvent('bottomToolbarHeight', event.bottomToolbarHeight);
    } else {
      return Composite$$1.prototype._trigger.call(this, name, event);
    }
  };

  NavigationView.prototype._triggerAppear = function _triggerAppear () {
    var topPage = this.pages().last();
    if (topPage) {
      topPage.trigger('appear', {target: topPage});
    }
  };

  NavigationView.prototype._triggerDisappear = function _triggerDisappear () {
    var topPage = this.pages().last();
    if (topPage) {
      topPage.trigger('disappear', {target: topPage});
    }
  };

  NavigationView.prototype.pages = function pages (selector) {
    return this.children(selector).filter(function (child) { return child instanceof Page; });
  };

  Object.defineProperties( NavigationView.prototype, prototypeAccessors );

  return NavigationView;
}(Composite));

NativeObject.defineProperties(NavigationView.prototype, {
  drawerActionVisible: {type: 'boolean', default: false},
  toolbarVisible: {type: 'boolean', default: true},
  toolbarColor: {type: 'color'},
  topToolbarHeight: {readonly: true},
  bottomToolbarHeight: {readonly: true},
  titleTextColor: {type: 'color'},
  actionColor: {type: 'color'},
  actionTextColor: {type: 'color'},
  pageAnimation: {type: ['choice', ['default', 'none']], default: 'default'},
  win_toolbarTheme: {type: ['choice', ['default', 'light', 'dark']], default: 'default'},
  win_toolbarOverflowTheme: {type: ['choice', ['default', 'light', 'dark']], default: 'default'},
  win_drawerActionTheme: {type: ['choice', ['default', 'light', 'dark']], default: 'default'},
  win_drawerActionBackground: {type: 'color'}
});

var Page = (function (Composite$$1) {
  function Page () {
    Composite$$1.apply(this, arguments);
  }

  if ( Composite$$1 ) Page.__proto__ = Composite$$1;
  Page.prototype = Object.create( Composite$$1 && Composite$$1.prototype );
  Page.prototype.constructor = Page;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.Page';
  };

  Page.prototype.insertBefore = function insertBefore () {
    throw new Error('insertBefore not supported on Page');
  };

  Page.prototype.insertAfter = function insertAfter () {
    throw new Error('insertAfter not supported on Page');
  };

  Page.prototype._setParent = function _setParent (parent, index) {
    if (parent && !(parent instanceof NavigationView)) {
      throw new Error('Page could not be appended to ' + parent);
    }
    Composite$$1.prototype._setParent.call(this, parent, index);
  };

  Object.defineProperties( Page.prototype, prototypeAccessors );

  return Page;
}(Composite));

NativeObject.defineProperties(Page.prototype, {
  image: {type: 'image', default: null},
  title: {type: 'string', default: ''},
  autoDispose: {type: 'boolean', default: true}
});

var Picker = (function (Widget$$1) {
  function Picker(properties) {
    var this$1 = this;

    Widget$$1.call(this, Object.assign({selectionIndex: 0}, properties));
    tabris.on('flush', this._flush, this);
    this.on('dispose', function () { return tabris.off('flush', this$1._flush, this$1); });
  }

  if ( Widget$$1 ) Picker.__proto__ = Widget$$1;
  Picker.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
  Picker.prototype.constructor = Picker;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.Picker';
  };

  Picker.prototype._flush = function _flush () {
    var this$1 = this;

    if (this.$needsUpdateItems) {
      var items = new Array(this.itemCount);
      for (var index = 0; index < items.length; index++) {
        items[index] = this$1.itemText(index);
      }
      this._nativeSet('items', items);
      tabris._nativeBridge.flush();
      delete this.$needsUpdateItems;
    }
    if (this.$newSelectionIndex >= 0) {
      this._nativeSet('selectionIndex', this.$newSelectionIndex);
      this._triggerChangeEvent('selectionIndex', this.$newSelectionIndex);
      tabris._nativeBridge.flush();
      delete this.$newSelectionIndex;
    }
  };

  Picker.prototype._listen = function _listen (name, listening) {
    if (name === 'select') {
      this._nativeListen(name, listening);
    } else if (name === 'selectionIndexChanged') {
      this._onoff('select', listening, this.$triggerSelectionIndexChanged);
    } else {
      Widget$$1.prototype._listen.call(this, name, listening);
    }
  };

  Picker.prototype._trigger = function _trigger (name, event) {
    if (name === 'select') {
      return Widget$$1.prototype._trigger.call(this, 'select', {index: event.selectionIndex});
    }
    return Widget$$1.prototype._trigger.call(this, name, event);
  };

  Picker.prototype.$triggerSelectionIndexChanged = function $triggerSelectionIndexChanged (ref) {
    var index = ref.index;

    this._triggerChangeEvent('selectionIndex', index);
  };

  Object.defineProperties( Picker.prototype, prototypeAccessors );

  return Picker;
}(Widget));

NativeObject.defineProperties(Picker.prototype, {
  itemCount: {
    type: 'natural',
    default: 0,
    set: function set(name, value) {
      this._storeProperty(name, value);
      this.$needsUpdateItems = true;
    }
  },
  itemText: {
    type: 'function',
    default: function () { return function () { return ''; }; },
    set: function set(name, value) {
      this.$needsUpdateItems = true;
      this._storeProperty(name, value);
    }
  },
  selectionIndex: {
    type: 'natural',
    default: 0,
    set: function set(name, value) {
      this.$newSelectionIndex = value;
    },
    get: function get(name) {
      return this._nativeGet(name);
    }
  },
  fillColor: {type: 'color'},
  borderColor: {type: 'color'},
  textColor: {type: 'color'}
});

var Pbkdf2 = (function (NativeObject$$1) {
  function Pbkdf2() {
    NativeObject$$1.call(this);
    this._create('tabris.pkcs5.Pbkdf2');
    this._nativeListen('done', true);
  }

  if ( NativeObject$$1 ) Pbkdf2.__proto__ = NativeObject$$1;
  Pbkdf2.prototype = Object.create( NativeObject$$1 && NativeObject$$1.prototype );
  Pbkdf2.prototype.constructor = Pbkdf2;

  Pbkdf2.prototype.start = function start (parameters) {
    this._nativeCall('start', parameters);
  };

  return Pbkdf2;
}(NativeObject));

var Pkcs5 = function Pkcs5 () {};

Pkcs5.prototype.pbkdf2 = function pbkdf2 (password, salt, iterationCount, keySize) {
    var arguments$1 = arguments;

  return new Promise(function (resolve) {
    if (arguments$1.length < 4) {
      throw new Error('Not enough arguments to pbkdf2');
    }
    if (typeof password !== 'string') {
      throw new Error('Invalid type for password in pbkdf2');
    }
    if (!(salt instanceof Uint8Array)) {
      throw new Error('Invalid type for salt in pbkdf2');
    }
    if (typeof iterationCount !== 'number' || iterationCount <= 0) {
      throw new Error('Invalid number for iterationCount in pbkdf2');
    }
    if (typeof keySize !== 'number' || keySize <= 0) {
      throw new Error('Invalid number for keySize in pbkdf2');
    }
    var pbkdf2 = new Pbkdf2();
    pbkdf2.on('done', function (event) {
      pbkdf2.dispose();
      resolve(event.key);
    });
    // TODO: transfer salt as typed array once iOS 9 support is discontinued
    pbkdf2.start({password: password, salt: toArray(salt), iterationCount: iterationCount, keySize: keySize});
  });
};

function toArray(typedArray) {
  var array = new Array(typedArray.length);
  for (var i = 0; i < typedArray.length; i++) {
    array[i] = typedArray[i];
  }
  return array;
}

var ProgressEvent = (function (Event$$1) {
  function ProgressEvent(type, config) {
    if (arguments.length < 1) {
      throw new Error('Not enough arguments to ProgressEvent');
    }
    Event$$1.call(this, type, config);
    this.$lengthComputable = config && config.lengthComputable || false;
    this.$loaded = config && config.loaded || 0;
    this.$total = config && config.total || 0;
  }

  if ( Event$$1 ) ProgressEvent.__proto__ = Event$$1;
  ProgressEvent.prototype = Object.create( Event$$1 && Event$$1.prototype );
  ProgressEvent.prototype.constructor = ProgressEvent;

  var prototypeAccessors = { lengthComputable: {},loaded: {},total: {} };

  prototypeAccessors.lengthComputable.get = function () {
    return this.$lengthComputable;
  };

  prototypeAccessors.loaded.get = function () {
    return this.$loaded;
  };

  prototypeAccessors.total.get = function () {
    return this.$total;
  };

  Object.defineProperties( ProgressEvent.prototype, prototypeAccessors );

  return ProgressEvent;
}(Event));

var ProgressBar = (function (Widget$$1) {
  function ProgressBar () {
    Widget$$1.apply(this, arguments);
  }

  if ( Widget$$1 ) ProgressBar.__proto__ = Widget$$1;
  ProgressBar.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
  ProgressBar.prototype.constructor = ProgressBar;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.ProgressBar';
  };

  Object.defineProperties( ProgressBar.prototype, prototypeAccessors );

  return ProgressBar;
}(Widget));

NativeObject.defineProperties(ProgressBar.prototype, {
  minimum: {type: 'integer', default: 0},
  maximum: {type: 'integer', default: 100},
  tintColor: {type: 'color'},
  selection: {type: 'integer', default: 0},
  state: {type: ['choice', ['normal', 'paused', 'error']], default: 'normal'}
});

var RadioButton = (function (Widget$$1) {
  function RadioButton () {
    Widget$$1.apply(this, arguments);
  }

  if ( Widget$$1 ) RadioButton.__proto__ = Widget$$1;
  RadioButton.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
  RadioButton.prototype.constructor = RadioButton;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.RadioButton';
  };

  RadioButton.prototype._listen = function _listen (name, listening) {
    if (name === 'select') {
      this._nativeListen(name, listening);
    } else if (name === 'checkedChanged') {
      this._onoff('select', listening, this.$triggerChangeChecked);
    } else {
      Widget$$1.prototype._listen.call(this, name, listening);
    }
  };

  RadioButton.prototype.$triggerChangeChecked = function $triggerChangeChecked (ref) {
    var checked = ref.checked;

    this._triggerChangeEvent('checked', checked);
  };

  Object.defineProperties( RadioButton.prototype, prototypeAccessors );

  return RadioButton;
}(Widget));

NativeObject.defineProperties(RadioButton.prototype, {
  text: {type: 'string', default: ''},
  checked: {type: 'boolean', nocache: true},
  textColor: {type: 'color'},
});

var EVENT_TYPES$4 = ['scrollX', 'scrollY'];

var ScrollView = (function (Composite$$1) {
  function ScrollView () {
    Composite$$1.apply(this, arguments);
  }

  if ( Composite$$1 ) ScrollView.__proto__ = Composite$$1;
  ScrollView.prototype = Object.create( Composite$$1 && Composite$$1.prototype );
  ScrollView.prototype.constructor = ScrollView;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.ScrollView';
  };

  ScrollView.prototype._listen = function _listen (name, listening) {
    if (EVENT_TYPES$4.includes(name)) {
      this._nativeListen(name, listening);
    } else if (name === 'offsetXChanged') {
      this._onoff('scrollX', listening, this.$triggerChangeOffsetX);
    } else if (name === 'offsetYChanged') {
      this._onoff('scrollY', listening, this.$triggerChangeOffsetY);
    } else {
      Composite$$1.prototype._listen.call(this, name, listening);
    }
  };

  ScrollView.prototype.$triggerChangeOffsetX = function $triggerChangeOffsetX (ref) {
    var offset = ref.offset;

    this._triggerChangeEvent('offsetX', offset);
  };

  ScrollView.prototype.$triggerChangeOffsetY = function $triggerChangeOffsetY (ref) {
    var offset = ref.offset;

    this._triggerChangeEvent('offsetY', offset);
  };

  ScrollView.prototype.scrollToY = function scrollToY (offset, options) {
    this._nativeCall('scrollToY', {
      offset: offset,
      animate: options && 'animate' in options ? !!options.animate : true
    });
    return this;
  };

  ScrollView.prototype.scrollToX = function scrollToX (offset, options) {
    this._nativeCall('scrollToX', {
      offset: offset,
      animate: options && 'animate' in options ? !!options.animate : true
    });
    return this;
  };

  Object.defineProperties( ScrollView.prototype, prototypeAccessors );

  return ScrollView;
}(Composite));

NativeObject.defineProperties(ScrollView.prototype, {
  direction: {
    type: ['choice', ['horizontal', 'vertical']],
    default: 'vertical'
  },
  offsetX: {type: 'number', nocache: true, readonly: true},
  offsetY: {type: 'number', nocache: true, readonly: true}
});

var Slider = (function (Widget$$1) {
  function Slider () {
    Widget$$1.apply(this, arguments);
  }

  if ( Widget$$1 ) Slider.__proto__ = Widget$$1;
  Slider.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
  Slider.prototype.constructor = Slider;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.Slider';
  };

  Slider.prototype._listen = function _listen (name, listening) {
    if (name === 'select') {
      this._nativeListen(name, listening);
    } else if (name === 'selectionChanged') {
      this._onoff('select', listening, this.$triggerChangeSelection);
    } else {
      Widget$$1.prototype._listen.call(this, name, listening);
    }
  };

  Slider.prototype.$triggerChangeSelection = function $triggerChangeSelection (ref) {
    var selection = ref.selection;

    this._triggerChangeEvent('selection', selection);
  };

  Object.defineProperties( Slider.prototype, prototypeAccessors );

  return Slider;
}(Widget));

NativeObject.defineProperties(Slider.prototype, {
  minimum: {type: 'integer', default: 0},
  maximum: {type: 'integer', default: 100},
  selection: {type: 'integer', nocache: true},
  tintColor: {type: 'color'}
});

var Switch = (function (Widget$$1) {
  function Switch () {
    Widget$$1.apply(this, arguments);
  }

  if ( Widget$$1 ) Switch.__proto__ = Widget$$1;
  Switch.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
  Switch.prototype.constructor = Switch;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.Switch';
  };

  Switch.prototype._listen = function _listen (name, listening) {
    if (name === 'select') {
      this._nativeListen(name, listening);
    } else if (name === 'checkedChanged') {
      this._onoff('select', listening, this.$triggerChangeChecked);
    } else {
      Widget$$1.prototype._listen.call(this, name, listening);
    }
  };

  Switch.prototype.$triggerChangeChecked = function $triggerChangeChecked (ref) {
    var checked = ref.checked;

    this._triggerChangeEvent('checked', checked);
  };

  Object.defineProperties( Switch.prototype, prototypeAccessors );

  return Switch;
}(Widget));

NativeObject.defineProperties(Switch.prototype, {
  checked: {type: 'boolean', nocache: true},
  thumbOnColor: {type: 'color'},
  thumbOffColor: {type: 'color'},
  trackOnColor: {type: 'color'},
  trackOffColor: {type: 'color'}
});

var EVENT_TYPES$5 = ['select', 'scroll'];

var TabFolder = (function (Composite$$1) {
  function TabFolder () {
    Composite$$1.apply(this, arguments);
  }

  if ( Composite$$1 ) TabFolder.__proto__ = Composite$$1;
  TabFolder.prototype = Object.create( Composite$$1 && Composite$$1.prototype );
  TabFolder.prototype.constructor = TabFolder;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.TabFolder';
  };

  TabFolder.prototype._acceptChild = function _acceptChild (child) {
    return child instanceof Tab;
  };

  TabFolder.prototype._listen = function _listen (name, listening) {
    if (EVENT_TYPES$5.includes(name)) {
      this._nativeListen(name, listening);
    } else if (name === 'selectionChanged') {
      this._onoff('select', listening, this.$triggerChangeSelection);
    } else {
      Composite$$1.prototype._listen.call(this, name, listening);
    }
  };

  TabFolder.prototype._trigger = function _trigger (name, event) {
    if (name === 'select') {
      var tab = tabris._proxies.find(event.selection);
      return Composite$$1.prototype._trigger.call(this, 'select', {tab: tab});
    }
    if (name === 'scroll') {
      var selection = event.selection ? tabris._proxies.find(event.selection) : null;
      return Composite$$1.prototype._trigger.call(this, 'scroll', {selection: selection, offset: event.offset});
    }
    return Composite$$1.prototype._trigger.call(this, name, event);
  };

  TabFolder.prototype.$triggerChangeSelection = function $triggerChangeSelection (ref) {
    var tab = ref.tab;

    this._triggerChangeEvent('selection', tab);
  };

  Object.defineProperties( TabFolder.prototype, prototypeAccessors );

  return TabFolder;
}(Composite));

NativeObject.defineProperties(TabFolder.prototype, {
  paging: {type: 'boolean', default: false},
  tabBarLocation: {type: ['choice', ['top', 'bottom', 'hidden', 'auto']], default: 'auto'},
  tabMode: {type: ['choice', ['fixed', 'scrollable']], default: 'fixed'},
  selection: {
    set: function set(name, tab) {
      if (this._children.indexOf(tab) < 0) {
        console.warn('Can not set TabFolder selection to ' + tab);
        return;
      }
      this._nativeSet('selection', tab.cid);
      this._triggerChangeEvent('selection', tab);
    },
    get: function get() {
      var selection = this._nativeGet('selection');
      return selection ? tabris._proxies.find(selection) : null;
    }
  },
  textColor: {type: 'color'},
  win_tabBarTheme: {type: ['choice', ['default', 'light', 'dark']], default: 'default'},
});

var Tab = (function (Composite$$1) {
  function Tab () {
    Composite$$1.apply(this, arguments);
  }

  if ( Composite$$1 ) Tab.__proto__ = Composite$$1;
  Tab.prototype = Object.create( Composite$$1 && Composite$$1.prototype );
  Tab.prototype.constructor = Tab;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.Tab';
  };

  Tab.prototype._setParent = function _setParent (parent, index) {
    if (parent && !(parent instanceof TabFolder)) {
      throw new Error('Tab could not be appended to ' + parent);
    }
    Composite$$1.prototype._setParent.call(this, parent, index);
  };

  Object.defineProperties( Tab.prototype, prototypeAccessors );

  return Tab;
}(Composite));

NativeObject.defineProperties(Tab.prototype, {
  title: {type: 'string', default: ''},
  image: {type: 'image', default: null},
  selectedImage: {type: 'image', default: null},
  badge: {type: 'string', default: ''}
});

var EVENT_TYPES$6 = ['focus', 'blur', 'accept', 'input'];

var TextInput = (function (Widget$$1) {
  function TextInput () {
    Widget$$1.apply(this, arguments);
  }

  if ( Widget$$1 ) TextInput.__proto__ = Widget$$1;
  TextInput.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
  TextInput.prototype.constructor = TextInput;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.TextInput';
  };

  TextInput.prototype._listen = function _listen (name, listening) {
    if (EVENT_TYPES$6.includes(name)) {
      this._nativeListen(name, listening);
    } else if (name === 'textChanged') {
      this._onoff('input', listening, this.$triggerChangeSelection);
    } else {
      Widget$$1.prototype._listen.call(this, name, listening);
    }
  };

  TextInput.prototype.$triggerChangeSelection = function $triggerChangeSelection (ref) {
    var text = ref.text;

    this._triggerChangeEvent('text', text);
  };

  Object.defineProperties( TextInput.prototype, prototypeAccessors );

  return TextInput;
}(Widget));

NativeObject.defineProperties(TextInput.prototype, {
  type: {type: ['choice', ['default', 'password', 'search', 'multiline']]},
  text: {type: 'string', nocache: true},
  message: {type: 'string', default: ''},
  editable: {type: 'boolean', default: true},
  keepFocus: {type: 'boolean'},
  alignment: {type: ['choice', ['left', 'center', 'right']], default: 'left'},
  autoCorrect: {type: 'boolean', default: false},
  autoCapitalize: {type: 'boolean', nocache: true},
  keyboard: {
    type: ['choice', ['ascii', 'decimal', 'email', 'number', 'numbersAndPunctuation', 'phone', 'url', 'default']],
    default: 'default'
  },
  enterKeyType: {
    type: ['choice', ['default', 'done', 'next', 'send', 'search', 'go']],
    default: 'default'
  },
  focused: {type: 'boolean', nocache: true},
  fillColor: {type: 'color'},
  borderColor: {type: 'color'},
  textColor: {type: 'color'}
});

var TextView = (function (Widget$$1) {
  function TextView () {
    Widget$$1.apply(this, arguments);
  }

  if ( Widget$$1 ) TextView.__proto__ = Widget$$1;
  TextView.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
  TextView.prototype.constructor = TextView;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.TextView';
  };

  Object.defineProperties( TextView.prototype, prototypeAccessors );

  return TextView;
}(Widget));

NativeObject.defineProperties(TextView.prototype, {
  alignment: {type: ['choice', ['left', 'right', 'center']], default: 'left'},
  markupEnabled: {type: 'boolean', default: false}, // TODO: readonly
  lineSpacing: {type: 'number', default: 1},
  selectable: {type: 'boolean', default: false},
  maxLines: {
    type: ['nullable', 'natural'],
    default: null,
    set: function set(name, value) {
      this._nativeSet(name, value <= 0 ? null : value);
      this._storeProperty(name, value);
    }
  },
  text: {type: 'string', default: ''},
  textColor: {type: 'color'}
});

var ToggleButton = (function (Widget$$1) {
  function ToggleButton () {
    Widget$$1.apply(this, arguments);
  }

  if ( Widget$$1 ) ToggleButton.__proto__ = Widget$$1;
  ToggleButton.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
  ToggleButton.prototype.constructor = ToggleButton;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.ToggleButton';
  };

  ToggleButton.prototype._listen = function _listen (name, listening) {
    if (name === 'select') {
      this._nativeListen(name, listening);
    } else if (name === 'checkedChanged') {
      this._onoff('select', listening, this.$triggerChangeChecked);
    } else {
      Widget$$1.prototype._listen.call(this, name, listening);
    }
  };

  ToggleButton.prototype.$triggerChangeChecked = function $triggerChangeChecked (ref) {
    var checked = ref.checked;

    this._triggerChangeEvent('checked', checked);
  };

  Object.defineProperties( ToggleButton.prototype, prototypeAccessors );

  return ToggleButton;
}(Widget));

NativeObject.defineProperties(ToggleButton.prototype, {
  text: {type: 'string', default: ''},
  image: {type: 'image', default: null},
  checked: {type: 'boolean', nocache: true},
  alignment: {type: ['choice', ['left', 'right', 'center']], default: 'center'},
  textColor: {type: 'color'}
});

var Video = (function (Widget$$1) {
  function Video () {
    Widget$$1.apply(this, arguments);
  }

  if ( Widget$$1 ) Video.__proto__ = Widget$$1;
  Video.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
  Video.prototype.constructor = Video;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.Video';
  };

  Video.prototype._listen = function _listen (name, listening) {
    if (name === 'stateChanged' || name === 'speedChanged') {
      this._nativeListen(name, listening) ;
    } else {
      Widget$$1.prototype._listen.call(this, name, listening);
    }
  };

  Video.prototype._trigger = function _trigger (name, event) {
    if (name === 'stateChanged') {
      return this._triggerChangeEvent('state', event.state);
    } else if (name === 'speedChanged') {
      return this._triggerChangeEvent('speed', event.speed);
    }
    return Widget$$1.prototype._trigger.call(this, name, event);
  };

  Video.prototype.pause = function pause () {
    this._nativeCall('pause');
  };

  Video.prototype.play = function play (speed) {
    this._nativeCall('play', {
      speed: arguments.length > 0 ? types.number.encode(speed) : 1
    });
  };

  Video.prototype.seek = function seek (position) {
    this._nativeCall('seek', {position: types.number.encode(position)});
  };

  Object.defineProperties( Video.prototype, prototypeAccessors );

  return Video;
}(Widget));

NativeObject.defineProperties(Video.prototype, {
  url: {type: 'string', default: ''},
  controlsVisible: {type: 'boolean', default: true},
  autoPlay: {type: 'boolean', default: true},
  speed: {readonly: true},
  position: {readonly: true},
  duration: {readonly: true},
  state: {readonly: true}
});

var EVENT_TYPES$7 = ['navigate', 'load', 'download', 'message'];

var WebView = (function (Widget$$1) {
  function WebView () {
    Widget$$1.apply(this, arguments);
  }

  if ( Widget$$1 ) WebView.__proto__ = Widget$$1;
  WebView.prototype = Object.create( Widget$$1 && Widget$$1.prototype );
  WebView.prototype.constructor = WebView;

  var prototypeAccessors = { _nativeType: {} };

  prototypeAccessors._nativeType.get = function () {
    return 'tabris.WebView';
  };

  WebView.prototype._listen = function _listen (name, listening) {
    if (EVENT_TYPES$7.includes(name)) {
      this._nativeListen(name, listening);
    } else {
      Widget$$1.prototype._listen.call(this, name, listening);
    }
  };

  WebView.prototype.postMessage = function postMessage (data, targetOrigin) {
    this._nativeCall('postMessage', {
      data: data,
      origin: targetOrigin
    });
    return this;
  };

  WebView.prototype.goBack = function goBack () {
    this._nativeCall('goBack');
  };

  WebView.prototype.goForward = function goForward () {
    this._nativeCall('goForward');
  };

  WebView.prototype._loadData = function _loadData (data, mimeType) {
    this._nativeCall('loadData', {data: data, mimeType: mimeType});
  };

  Object.defineProperties( WebView.prototype, prototypeAccessors );

  return WebView;
}(Widget));

NativeObject.defineProperties(WebView.prototype, {
  url: {type: 'string', nocache: true},
  html: {type: 'string', nocache: true},
  headers: {type: 'any', default: {}},
  canGoBack: {type: 'boolean', nocache: true, readonly: true},
  canGoForward: {type: 'boolean', nocache: true, readonly: true},
  initScript: {type: 'string'}
});

var CONNECTING = 0;
var OPEN = 1;
var CLOSING = 2;
var CLOSED = 3;
var CONSTANTS = {
  CONNECTING: {value: CONNECTING},
  OPEN: {value: OPEN},
  CLOSING: {value: CLOSING},
  CLOSED: {value: CLOSED}
};
var EVENT_TYPES$8 = ['open', 'message', 'close', 'error'];

var _WebSocket = (function (NativeObject$$1) {
  function _WebSocket(properties) {
    var this$1 = this;

    NativeObject$$1.call(this);
    this._create('tabris.WebSocket', properties);
    EVENT_TYPES$8.forEach(function (type) { return this$1._nativeListen(type, true); });
  }

  if ( NativeObject$$1 ) _WebSocket.__proto__ = NativeObject$$1;
  _WebSocket.prototype = Object.create( NativeObject$$1 && NativeObject$$1.prototype );
  _WebSocket.prototype.constructor = _WebSocket;

  return _WebSocket;
}(NativeObject));

NativeObject.defineProperties(_WebSocket.prototype, {
  url: {type: 'string', default: ''},
  protocol: {type: 'any', default: ''},
  binaryType: {type: 'string', default: 'blob'},
  bufferedAmount: {type: 'number', nocache: true}
});

var WebSocket = function WebSocket(url, protocol) {
  if (typeof url !== 'string') {
    throw new Error('The WebSocket url has to be of type string');
  }
  var scheme = extractScheme(url);
  if (!(scheme === 'ws' || scheme === 'wss')) {
    throw new Error("The WebSocket url has to have a scheme of 'ws' or 'wss' but is '" + scheme + "'");
  }
  if (typeof protocol !== 'string' && !Array.isArray(protocol)) {
    throw new Error('The WebSocket protocol has too be a string or an array of strings');
  }
  var protocols = Array.isArray(protocol) ? protocol : [protocol];
  this.url = url;
  this.readyState = CONNECTING;
  this.protocol = '';
  this.extensions = '';
  addDOMEventTargetMethods(this);
  defineEventHandlerProperties(this, EVENT_TYPES$8);
  this._proxy = this.$createProxy(url, protocols);
};

var prototypeAccessors$4 = { binaryType: {},bufferedAmount: {} };

WebSocket.prototype.$createProxy = function $createProxy (url, protocols) {
    var this$1 = this;

  return new _WebSocket({
    url: url,
    protocol: protocols
  }).on('open', function (event) {
    this$1.readyState = OPEN;
    this$1.protocol = event.protocol;
    this$1.extensions = event.extensions;
    this$1.dispatchEvent(Object.assign(new Event('open'), omit(event, ['target', 'type', 'timeStamp'])));
  }).on('message', function (event) {
    if (this$1.readyState === OPEN) {
      this$1.dispatchEvent(Object.assign(new Event('message'), omit(event, ['target', 'type', 'timeStamp'])));
    }
  }).on('close', function (event) {
    this$1.readyState = CLOSED;
    this$1.dispatchEvent(Object.assign(new Event('close'), omit(event, ['target', 'type', 'timeStamp'])));
  }).on('error', function (event) {
    this$1.readyState = CLOSED;
    this$1.dispatchEvent(Object.assign(new Event('error'), omit(event, ['target', 'type', 'timeStamp'])));
  });
};

prototypeAccessors$4.binaryType.set = function (binaryType) {
  this._proxy.binaryType = binaryType;
};

prototypeAccessors$4.binaryType.get = function () {
  return this._proxy.binaryType;
};

prototypeAccessors$4.bufferedAmount.set = function (bufferedAmount) {
  console.warn('Can not set read-only property "bufferedAmount"');
};

prototypeAccessors$4.bufferedAmount.get = function () {
  return this._proxy.bufferedAmount;
};

WebSocket.prototype.send = function send (data) {
  if (this.readyState === CONNECTING) {
    throw new Error("Can not 'send' WebSocket message when WebSocket state is CONNECTING");
  }
  if (typeof data === 'string') {
    this._proxy._nativeCall('send', {data: data});
  } else if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
    this._proxy._nativeCall('send', {data: data});
  } else {
    throw new Error('Data of type ' + typeof data + " is not supported in WebSocket 'send' operation");
  }
};

WebSocket.prototype.close = function close (code, reason) {
  if (code &&
    (typeof code !== 'number' || !(typeof code === 'number' && (code === 1000 || code >= 3000 && code <= 4999)))) {
    throw new Error('A given close code has to be either 1000 or in the range 3000 - 4999 inclusive');
  }
  if (reason && getStringByteSize(reason) > 123) {
    throw new Error('The close reason can not be larger than 123 utf-8 bytes');
  }
  if (this.readyState !== CLOSING && this.readyState !== CLOSED) {
    this.readyState = CLOSING;
    var properties = {};
    if (code) {
      properties.code = code;
    }
    if (reason) {
      properties.reason = reason;
    }
    this._proxy._nativeCall('close', properties);
  }
};

Object.defineProperties( WebSocket.prototype, prototypeAccessors$4 );

Object.defineProperties(WebSocket, CONSTANTS);
Object.defineProperties(WebSocket.prototype, CONSTANTS);

function getStringByteSize(input) {
  var len = 0;
  // TODO: workaround for https://github.com/babel/babili/issues/430
  if (!input.length) {
    return 0;
  }
  for (var i = 0; i < input.length; i++) {
    var code = input.charCodeAt(i);
    if (code <= 0x7f) {
      len += 1;
    } else if (code <= 0x7ff) {
      len += 2;
    } else if (code >= 0xd800 && code <= 0xdfff) {
      // Surrogate pair: These take 4 bytes in UTF-8 and 2 chars in UCS-2
      // (Assume next char is the other [valid] half and just skip it)
      len += 4;
      i++;
    } else if (code < 0xffff) {
      len += 3;
    } else {
      len += 4;
    }
  }
  return len;
}

function extractScheme(url) {
  var match = /^(\S+?):/.exec(url);
  return match ? match[1] : null;
}

var HttpRequest = (function (NativeObject$$1) {
  function HttpRequest() {
    NativeObject$$1.call(this);
    this._create('tabris.HttpRequest');
    this._nativeListen('stateChanged', true);
    this._nativeListen('downloadProgress', true);
    this._nativeListen('uploadProgress', true);
  }

  if ( NativeObject$$1 ) HttpRequest.__proto__ = NativeObject$$1;
  HttpRequest.prototype = Object.create( NativeObject$$1 && NativeObject$$1.prototype );
  HttpRequest.prototype.constructor = HttpRequest;

  HttpRequest.prototype.abort = function abort () {
    this._nativeCall('abort', {});
  };

  HttpRequest.prototype.send = function send (config) {
    this._nativeCall('send', config);
  };

  return HttpRequest;
}(NativeObject));

// XHR Spec: https://xhr.spec.whatwg.org/

var UNSENT = 0;
var OPENED = 1;
var HEADERS_RECEIVED = 2;
var LOADING = 3;
var DONE = 4;

var EVENT_TYPES$9 = [
  'loadstart', 'readystatechange', 'load', 'loadend', 'progress', 'timeout', 'abort', 'error'
];
var UPLOAD_EVENT_TYPES = ['progress', 'loadstart', 'load', 'loadend', 'timeout', 'abort', 'error'];

var SUPPORTED_SCHEMES = ['http', 'https', 'file'];

var XMLHttpRequest = function XMLHttpRequest() {
  this.$authorRequestHeaders = {};
  this.$timeout = 0;
  this.$status = 0;
  this.$statusText = '';
  this.$responseHeaders = '';
  this.$readyState = UNSENT;
  this.$responseData = '';
  this.$withCredentials = false;
  this.$responseType = '';
  this.$sendInvoked = false;
  this.$isSynchronous = false;
  this.$error = false;
  this.$uploadComplete = false;
  Object.defineProperty(this, 'upload', {value: {}});
  defineEventHandlerProperties(this, EVENT_TYPES$9);
  defineEventHandlerProperties(this.upload, UPLOAD_EVENT_TYPES);
  addDOMEventTargetMethods(this);
  addDOMEventTargetMethods(this.upload);
};

var prototypeAccessors$5 = { readyState: {},timeout: {},responseText: {},response: {},responseType: {},status: {},statusText: {},withCredentials: {} };

prototypeAccessors$5.readyState.get = function () {
  return this.$readyState;
};

prototypeAccessors$5.timeout.get = function () {
  return this.$timeout;
};

prototypeAccessors$5.timeout.set = function (value) {
  // (1): superfluous, as we don't support synchronous requests
  if (!isNaN(value)) { // (2)
    this.$timeout = Math.round(value);
  }
};

prototypeAccessors$5.responseText.get = function () {
  // 1. If responseType is not the empty string or "text", throw an InvalidStateError exception.
  if (this.$responseType !== '' && this.$responseType !== 'text') {
    throw new Error('XHR responseText not accessible for non-text responseType');
  }
  // 2. If state is not loading or done, return the empty string.
  if ((this.$readyState !== LOADING && this.$readyState !== DONE)) {
    return '';
  }
  // 3. Return the text response.
  return this.$responseData || '';
};

prototypeAccessors$5.response.get = function () {
  // If responseType is the empty string or "text"
  if (this.$responseType === '' || this.$responseType === 'string') {
    // 1. If state is not loading or done, return the empty string.
    if (this.$readyState !== LOADING && this.$readyState !== DONE) {
      return '';
    }
    // 2. Return the text response.
    return this.$responseData || '';
  }
  // Otherwise
  // 1. If state is not done, return null.
  if (this.$readyState !== DONE) {
    return null;
  }
  // 2. If responseType is "arraybuffer"
  // Return the arraybuffer response.
  return this.$responseData;
};

prototypeAccessors$5.responseType.get = function () {
  return this.$responseType;
};

prototypeAccessors$5.responseType.set = function (value) {
  // 1. (concurrency related, skip)
  // 2. If state is loading or done, throw an InvalidStateError exception.
  if ((this.$readyState === LOADING || this.$readyState === DONE)) {
    throw new Error('The response type cannot be set when state is LOADING or DONE.');
  }
  // 3. (concurrency related, skip)
  // 4. Set the responseType attribute's value to the given value.
  // mimicking Chromium and Firefox behaviour when setting a not allowed responseType:
  if (['arraybuffer', 'blob', 'document', 'json', 'text'].indexOf(value) < 0) {
    return;
  }
  // currently only the response types 'text' and 'arraybuffer' are supported
  if (['blob', 'document', 'json'].indexOf(value) > -1) {
    throw new Error("Unsupported responseType, only 'text' and 'arraybuffer' are supported");
  }
  this.$responseType = value;
};

prototypeAccessors$5.status.get = function () {
  if ([OPENED, UNSENT].indexOf(this.$readyState) > -1) {
    return 0;
  }
  if (this.$error) {
    return 0;
  }
  return this.$status;
};

prototypeAccessors$5.statusText.get = function () {
  if ([OPENED, UNSENT].indexOf(this.$readyState) > -1) {
    return '';
  }
  if (this.$error) {
    return '';
  }
  return this.$statusText;
};

prototypeAccessors$5.withCredentials.get = function () {
  return this.$withCredentials;
};

prototypeAccessors$5.withCredentials.set = function (value) {
  if (this.$readyState !== UNSENT && this.$readyState !== OPENED) {
    throw new Error(
        "InvalidStateError: state must be 'UNSENT' or 'OPENED' when setting withCredentials"
    );
  }
  if (this.$sendInvoked) {
    throw new Error("InvalidStateError: 'send' invoked, failed to set 'withCredentials'");
  }
  // (3): superfluous as we don't support synchronous requests
  // mimicking Chromium and Firefox behaviour when setting a non-boolean value:
  if (typeof value === 'boolean') {
    this.$withCredentials = value; // (4)
  }
};

XMLHttpRequest.prototype.open = function open (method, url, async, username, password) {
  var parsedUrl = {};
  // (2), (3), (4): we don't implement the 'settings' object
  validateRequiredOpenArgs(method, url);
  parsedUrl.source = url; // (8), (9): experimental non-standard parsing implementation:
  // regex taken from http://stackoverflow.com/a/8206299:
  var urlWithoutProtocol = url.replace(/.*?:\/\//g, '');
  // regex taken from http://stackoverflow.com/a/19709846:
  parsedUrl.isRelative = !new RegExp('^(?:[a-z]+:)?//', 'i').test(url);
  parsedUrl.userdata = urlWithoutProtocol.substring(0, urlWithoutProtocol.indexOf('@'));
  if (typeof async === 'undefined') { // (10)
    async = true;
    username = null;
    password = null;
  }
  if (!async) {
    throw new Error('Only asynchronous request supported.');
  }
  if (parsedUrl.isRelative) { // (11)
    if (username && password) {
      parsedUrl.userdata = username + ':' + password;
    }
  }
  // (12): superfluous as we don't support synchronous requests
  // TODO: (13) - should we call 'abort' to the proxy? We'd need to move the creation of the proxy
  // to the open() function
  this.$requestMethod = method; // (14)
  this.$requestUrl = parsedUrl;
  this.$isSynchronous = !async;
  this.$authorRequestHeaders = {};
  this.$sendInvoked = false;
  this.$responseData = null;
  if (this.$readyState !== OPENED) { // (15)
    this.$readyState = OPENED;
    dispatchEvent('readystatechange', this);
  }
};

XMLHttpRequest.prototype.send = function send (data) {
    var this$1 = this;

  this.$proxy = new HttpRequest()
    .on('stateChanged', function (event) { return handleStateChange(event, this$1); })
    .on('downloadProgress', function (event) { return dispatchProgressEvent('progress', this$1, event); })
    .on('uploadProgress', function (event) { return dispatchProgressEvent('progress', this$1.upload, event); });
  if (this.$readyState !== OPENED) { // (1)
    throw new Error(
        "InvalidStateError: Object's state must be 'OPENED', failed to execute 'send'"
    );
  }
  if (this.$sendInvoked) { // (2)
    throw new Error("InvalidStateError: 'send' invoked, failed to execute 'send'");
  }
  if (['GET', 'HEAD'].indexOf(this.$requestMethod) > -1) { // (3)
    data = null;
  }
  this.$requestBody = data; // (4)
  // TODO: support encoding and mimetype for string response types
  // (5): no storage mutex
  this.$error = this.$uploadComplete = false; // (6), see (8)
  if (!data) { // (7)
    this.$uploadComplete = true;
  }
  // (8): uploadEvents is relevant for the "force preflight flag", but this logic is handled by
  // the client
  // Basic access authentication
  if (this.$withCredentials) {
    // TODO: encode userdata in base64, will not function if not encoded
    if (this.$requestUrl.userdata) {
      this.setRequestHeader('Authorization', 'Basic ' + this.$requestUrl.userdata);
    }
  }
  this.$sendInvoked = true; // (9.1)
  dispatchProgressEvent('loadstart', this); // (9.2)
  if (!this.$uploadComplete) {
    dispatchProgressEvent('loadstart', this.upload); // (9.3)
  }
  // (10): only handling the same origin case
  this.$proxy.send({ // request URL fetch
    url: this.$requestUrl.source,
    method: this.$requestMethod,
    timeout: this.timeout,
    headers: this.$authorRequestHeaders,
    data: this.$requestBody,
    responseType: this.$responseType
  });
};

XMLHttpRequest.prototype.abort = function abort () {
  if (this.$proxy) {
    this.$proxy.abort(); // (1)
  }
  if (!([UNSENT, OPENED].indexOf(this.$readyState) > -1 && !this.$sendInvoked ||
      this.$readyState === DONE)) { // send() interrupted
    // (2.1), (2.2): setting readyState DONE with sendInvoked true or false seems to be an
    // internal state which doesn't affect the behavior and thus cannot be tested
    dispatchEvent('readystatechange', this); // (2.3)
    if (!this.$uploadComplete) {
      this.$uploadComplete = true; // (2.4.1)
      dispatchAbortProgressEvents(this.upload); // (2.4.2), (2.4.3), (2.4.4)
    }
    dispatchAbortProgressEvents(this); // (2.5), (2.6), (2.7)
  }
  this.$readyState = UNSENT; // (3)
};

XMLHttpRequest.prototype.setRequestHeader = function setRequestHeader (header, value) { // #dom-xmlhttprequest-setrequestheader
  if (this.$readyState !== OPENED) { // (1)
    throw new Error('InvalidStateError: ' +
            "Object's state must be 'OPENED', failed to execute 'setRequestHeader'");
  }
  if (this.$sendInvoked) { // (2)
    throw new Error('InvalidStateError: ' +
            "cannot set request header if 'send()' invoked and request not completed");
  }
  if (!validHttpToken(header)) { // (3)
    throw new TypeError("Invalid HTTP header name, failed to execute 'open'");
  }
  if (!isValidHttpHeaderValue(value)) { // (4)
    throw new TypeError("Invalid HTTP header value, failed to execute 'open'");
  }
  // (5) (No headers are filtered out as this restriction does not apply to native apps)
  if (header in this.$authorRequestHeaders) { // (6):
    this.$authorRequestHeaders[header] = this.$authorRequestHeaders[header] + ', ' + value; // (7)
  } else {
    this.$authorRequestHeaders[header] = value; // (8)
  }
};

XMLHttpRequest.prototype.getResponseHeader = function getResponseHeader (header) {
    var this$1 = this;
 // #the-getresponseheader()-method
  if ([UNSENT, OPENED].indexOf(this.readyState) > -1) { // (1)
    return null;
  }
  if (this.$error) { // (2)
    return null;
  }
  // (3) (No headers are filtered out as this restriction does not apply to native apps)
  for (var key in this$1.$responseHeaders) { // (4), (5)
    if (key.toLowerCase() === header.toLowerCase()) {
      return this$1.$responseHeaders[key];
    }
  }
  return null; // (6)
};

XMLHttpRequest.prototype.getAllResponseHeaders = function getAllResponseHeaders () {
    var this$1 = this;
 // #the-getallresponseheaders()-method
  if ([UNSENT, OPENED].indexOf(this.readyState) > -1) { // (1)
    return '';
  }
  if (this.$error) { // (2)
    return '';
  }
  var result = [];
  for (var key in this$1.$responseHeaders) {
    result.push(key + ': ' + this$1.$responseHeaders[key]);
  }
  return result.join('\r\n');
};

Object.defineProperties( XMLHttpRequest.prototype, prototypeAccessors$5 );

Object.defineProperties(XMLHttpRequest.prototype, {
  UNSENT: {value: UNSENT},
  OPENED: {value: OPENED},
  HEADERS_RECEIVED: {value: HEADERS_RECEIVED},
  LOADING: {value: LOADING},
  DONE: {value: DONE}
});

function handleStateChange(event, xhr) {
  // Note: we supply lengthComputable, loaded and total only with the "progress" event types
  switch (event.state) {
    case 'headers':
      xhr.$readyState = HEADERS_RECEIVED;
      xhr.$status = event.code;
      xhr.$statusText = event.message;
      xhr.$responseHeaders = event.headers;
      dispatchEvent('readystatechange', xhr);
      xhr.$uploadComplete = true; // #make-upload-progress-notifications
      dispatchFinishedProgressEvents(xhr.upload);
      break;
    case 'loading':
      xhr.$readyState = LOADING;
      dispatchEvent('readystatechange', xhr);
      break;
    case 'finished':
      // TODO create response based on responseType
      xhr.$responseData = event.response;
      xhr.$readyState = DONE;
      dispatchEvent('readystatechange', xhr);
      dispatchFinishedProgressEvents(xhr);
      dispatchFinishedProgressEvents(xhr.upload);
      xhr.$proxy.dispose();
      xhr.$proxy = null;
      break;
    case 'error':
      handleRequestError('error', xhr);
      break;
    case 'timeout':
      handleRequestError('timeout', xhr);
      break;
    case 'abort':
      handleRequestError('abort', xhr);
      break;
  }
}

function handleRequestError(type, xhr) {
  xhr.$error = true; // (1*) (#terminate-the-request)
  xhr.$readyState = DONE; // (1)
  // (2): superfluous as we don't support synchronous requests
  dispatchEvent('readystatechange', xhr); // (3)
  dispatchErrorProgressEvents(type, xhr);
  if (!xhr.$uploadComplete) {
    xhr.$uploadComplete = true;
    dispatchErrorProgressEvents(type, xhr.upload);
  }
  xhr.$proxy.dispose();
  xhr.$proxy = null;
}

function validateRequiredOpenArgs(method, url) {
  if (!method) {
    throw new TypeError("Method argument should be specified to execute 'open'");
  }
  if (!url) {
    throw new TypeError("URL argument should be specified to execute 'open'");
  }
  validateMethod(method);
  validateUrl(url);
}

function validateMethod(method) {
  if (!validHttpToken(method)) {
    throw new TypeError("Invalid HTTP method, failed to execute 'open'");
  }
  // (6):
  var tokens = ['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'TRACE', 'TRACK'];
  var uppercaseMethod = method.toUpperCase();
  if (tokens.indexOf(uppercaseMethod) >= 0) {
    method = uppercaseMethod;
  }
  var forbiddenTokens = ['CONNECT', 'TRACE', 'TRACK']; // (7)
  if (forbiddenTokens.indexOf(method) >= 0) {
    throw new Error(
            "SecurityError: '" + method + "' HTTP method is not secure, failed to execute 'open'"
    );
  }
}

function validHttpToken(httpToken) {
  // RFC-compliant validation for HTTP tokens ported from Chromium:
  // https://chromium.googlesource.com/chromium/blink.git/+/master/Source/platform/network/HTTPParsers.cpp
  var forbiddenCharacters = [
    '(', ')', '<', '>', '@', ',', ';', ':', '\\', '"', '\/', '[', ']', '?', '=', '{', '}'
  ];
  return !(/[^\x21-\x7E]/.test(httpToken) || forbiddenCharacters.indexOf(httpToken) >= 0);
}

function isValidHttpHeaderValue(value) {
  // non-RFC compliant validation for HTTP header values ported from Chromium:
  // https://chromium.googlesource.com/chromium/blink.git/+/master/Source/platform/network/HTTPParsers.cpp
  // Regex for Latin-1 characters based on: http://www.ic.unicamp.br/~stolfi/EXPORT/www/ISO-8859-1-Encoding.html
  return /^[\x09\x0A\x0D\x20-\x7E\xA0-\xFF]*$/.test(value) && value.indexOf('\n') < 0 && value.indexOf('\r') < 0;
}

function validateUrl(url) {
  // TODO: rewrite (8),(9)
  var scheme = extractScheme$1(url);
  if (scheme && (SUPPORTED_SCHEMES.indexOf(scheme) === -1)) {
    throw new SyntaxError("Unsupported URL scheme, failed to execute 'open'");
  }
}

function extractScheme$1(url) {
  var match = /^(\S+?):/.exec(url);
  return match ? match[1] : null;
}

function dispatchEvent(type, target) {
  target.dispatchEvent(new Event(type));
}

function dispatchProgressEvent(type, target, config) {
  target.dispatchEvent(new ProgressEvent(type, config));
}

function dispatchAbortProgressEvents(target) {
  dispatchProgressEvent('progress', target);
  dispatchProgressEvent('abort', target);
  dispatchProgressEvent('loadend', target);
}

function dispatchErrorProgressEvents(type, target) {
  dispatchProgressEvent('progress', target);
  dispatchProgressEvent(type, target);
  dispatchProgressEvent('loadend', target);
}

function dispatchFinishedProgressEvents(target) {
  // Note: progress event is dispatched separately by the downloadProgress/uploadProgress callbacks
  dispatchProgressEvent('load', target);
  dispatchProgressEvent('loadend', target);
}

/**
 * Original work Copyright (c) 2014-2016 GitHub, Inc.
 * Implementation based on https://github.com/github/fetch
 */
var Headers = function Headers(headers) {
  var this$1 = this;

  this.$map = {};
  if (headers instanceof Headers) {
    headers.forEach(function (value, name) { return this$1.append(name, value); });
  } else if (Array.isArray(headers)) {
    headers.forEach(function (header) { return this$1.append(header[0], header[1]); });
  } else if (headers) {
    Object.getOwnPropertyNames(headers).forEach(function (name) { return this$1.append(name, headers[name]); });
  }
};

Headers.prototype.append = function append (name, value) {
  name = normalizeName(name);
  var oldValue = this.$map[name];
  this.$map[name] = oldValue ? oldValue + ',' + value : '' + value;
};

Headers.prototype.delete = function delete$1 (name) {
  delete this.$map[normalizeName(name)];
};

Headers.prototype.get = function get (name) {
  name = normalizeName(name);
  return this.has(name) ? this.$map[name] : null;
};

Headers.prototype.has = function has (name) {
  return this.$map.hasOwnProperty(normalizeName(name));
};

Headers.prototype.set = function set (name, value) {
  this.$map[normalizeName(name)] = '' + value;
};

Headers.prototype.forEach = function forEach (callback, thisArg) {
    var this$1 = this;

  for (var name in this$1.$map) {
    if (this$1.$map.hasOwnProperty(name)) {
      callback.call(thisArg, this$1.$map[name], name, this$1);
    }
  }
};

Headers.prototype.keys = function keys () {
  var items = [];
  this.forEach(function (value, name) { return items.push(name); });
  return iteratorFor(items);
};

Headers.prototype.values = function values () {
  var items = [];
  this.forEach(function (value) { return items.push(value); });
  return iteratorFor(items);
};

Headers.prototype.entries = function entries () {
  var items = [];
  this.forEach(function (value, name) { return items.push([name, value]); });
  return iteratorFor(items);
};

Headers.prototype[iteratorSymbol()] = function () {
  return this.entries();
};

function normalizeName(name) {
  name = '' + name;
  if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
    throw new TypeError('Invalid character in header field name');
  }
  return name.toLowerCase();
}

function iteratorFor(items) {
  var iterator = {
    next: function next() {
      var value = items.shift();
      return {done: value === undefined, value: value};
    }
  };
  iterator[iteratorSymbol()] = function() {
    return iterator;
  };
  return iterator;
}

// TODO replace when ES6 iterator is available on all platforms
function iteratorSymbol() {
  return 'Symbol' in global && 'iterator' in global.Symbol ? global.Symbol.iterator : '@@iterator';
}

var SUPPORTED_ENCODINGS = ['ascii', 'utf-8'];

var TextDecoder = (function (NativeObject$$1) {
  function TextDecoder() {
    NativeObject$$1.call(this);
    this._create('tabris.TextDecoder');
    this._nativeListen('result', true);
    this._nativeListen('error', true);
  }

  if ( NativeObject$$1 ) TextDecoder.__proto__ = NativeObject$$1;
  TextDecoder.prototype = Object.create( NativeObject$$1 && NativeObject$$1.prototype );
  TextDecoder.prototype.constructor = TextDecoder;

  TextDecoder.prototype.decode = function decode (buffer, encoding) {
    this._nativeCall('decode', {data: buffer, encoding: encoding});
  };

  return TextDecoder;
}(NativeObject));

function decode(buffer, encoding) {
  return new Promise(function (resolve, reject) {
    if (ArrayBuffer.isView(buffer)) {
      buffer = buffer.buffer;
    }
    if (!(buffer instanceof ArrayBuffer)) {
      throw new Error('Invalid buffer type');
    }
    encoding = encoding || 'utf-8';
    if (!SUPPORTED_ENCODINGS.includes(encoding)) {
      throw new Error(("Unsupported encoding: '" + encoding + "'"));
    }
    new TextDecoder()
      .on('result', function (ref) {
        var target = ref.target;
        var string = ref.string;

        resolve(string);
        target.dispose();
      })
      .on('error', function (ref) {
        var target = ref.target;

        reject(new Error('Could not decode ' + encoding));
        target.dispose();
      })
      .decode(buffer, encoding);
  });
}

/**
 * Original work Copyright (c) 2014-2016 GitHub, Inc.
 * Implementation based on https://github.com/github/fetch
 */
var Body = function Body () {};

var prototypeAccessors$6 = { bodyUsed: {},_encoding: {} };

Body.prototype._initBody = function _initBody (body) {
  this._bodyInit = body;
  if (!body) {
    this._bodyText = '';
  } else if (typeof body === 'string') {
    this._bodyText = body;
  } else if ((ArrayBuffer.prototype.isPrototypeOf(body) || ArrayBuffer.isView(body))) {
    this._bodyBuffer = body.slice(0);
  } else {
    throw new Error('unsupported BodyInit type');
  }
};

Body.prototype.text = function text () {
  return this.$consumed() || Promise.resolve(this._bodyBuffer ?
    decode(this._bodyBuffer, this._encoding) :
    this._bodyText);
};

Body.prototype.json = function json () {
  return this.text().then(JSON.parse);
};

Body.prototype.arrayBuffer = function arrayBuffer () {
  return this.$consumed() || Promise.resolve(this._bodyBuffer);
};

prototypeAccessors$6.bodyUsed.get = function () {
  return !!this.$bodyUsed;
};

Body.prototype.$consumed = function $consumed () {
  if (this.$bodyUsed) {
    return Promise.reject(new TypeError('Already read'));
  }
  this.$bodyUsed = true;
};

prototypeAccessors$6._encoding.get = function () {};

Object.defineProperties( Body.prototype, prototypeAccessors$6 );

/**
 * Original work Copyright (c) 2014-2016 GitHub, Inc.
 * Implementation based on https://github.com/github/fetch
 */
// HTTP methods whose capitalization should be normalized
var METHODS = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

var Request = (function (Body$$1) {
  function Request(input, options) {
    if ( options === void 0 ) options = {};

    Body$$1.call(this);
    var body = options.body;
    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read');
      }
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.$bodyUsed = true;
      }
    } else {
      input = {
        url: input
      };
    }
    Object.defineProperties(this, {
      url: {value: '' + input.url},
      method: {value: normalizeMethod(options.method || input.method || 'GET')},
      headers: {value: new Headers(options.headers || input.headers || {})},
      credentials: {value: options.credentials || input.credentials || 'omit'},
      mode: {value: options.mode || input.mode || null},
      referrer: {value: ''},
      timeout: {value: options.timeout || 0}
    });
    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests');
    }
    this._initBody(body);
  }

  if ( Body$$1 ) Request.__proto__ = Body$$1;
  Request.prototype = Object.create( Body$$1 && Body$$1.prototype );
  Request.prototype.constructor = Request;

  Request.prototype.clone = function clone () {
    return new Request(this, {
      body: this._bodyInit
    });
  };

  return Request;
}(Body));

function normalizeMethod(method) {
  var upcased = method.toUpperCase();
  return METHODS.includes(upcased) ? upcased : method;
}

/**
 * Original work Copyright (c) 2014-2016 GitHub, Inc.
 * Implementation based on https://github.com/github/fetch
 */
var REDIRECT_STATUSES = [301, 302, 303, 307, 308];

var Response = (function (Body$$1) {
  function Response(bodyInit, options) {
    if ( options === void 0 ) options = {};

    Body$$1.call(this);
    Object.defineProperties(this, {
      url: {value: options.url || ''},
      type: {value: options._type || 'default'},
      status: {value: 'status' in options ? options.status : 200},
      statusText: {value: 'statusText' in options ? options.statusText : 'OK'},
      headers: {value: new Headers(options.headers)}
    });
    this._initBody(bodyInit);
  }

  if ( Body$$1 ) Response.__proto__ = Body$$1;
  Response.prototype = Object.create( Body$$1 && Body$$1.prototype );
  Response.prototype.constructor = Response;

  var prototypeAccessors = { ok: {},_encoding: {} };

  prototypeAccessors.ok.get = function () {
    return this.status >= 200 && this.status < 300;
  };

  Response.prototype.clone = function clone () {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    });
  };

  prototypeAccessors._encoding.get = function () {
    var contentType = this.headers.get('content-type') || '';
    var parameters = contentType.split(';').slice(1);
    for (var i = 0, list = parameters; i < list.length; i += 1) {
      var param = list[i];

      var match = /charset=(\S+)/i.exec(param.trim());
      if (match) {
        return match[1].toLowerCase();
      }
    }
    return null;
  };

  Response.error = function error () {
    return new Response(null, {status: 0, statusText: '', _type: 'error'});
  };

  Response.redirect = function redirect (url, status) {
    if (!REDIRECT_STATUSES.includes(status)) {
      throw new RangeError('Invalid status code');
    }
    return new Response(null, {status: status, headers: {location: url}});
  };

  Object.defineProperties( Response.prototype, prototypeAccessors );

  return Response;
}(Body));

/**
 * Original work Copyright (c) 2014-2016 GitHub, Inc.
 * Implementation based on https://github.com/github/fetch
 */
function fetch(input, init) {
  return new Promise(function (resolve, reject) {
    var request = new Request(input, init);
    var hr = new HttpRequest();
    var options = {};
    hr.on('stateChanged', function (event) {
      switch (event.state) {
        case 'headers':
          options.status = event.code;
          options.statusText = event.message;
          options.headers = new Headers(event.headers);
          break;
        case 'finished':
          options.url = options.headers.get('X-Request-URL') || request.url;
          resolve(new Response(event.response, options));
          hr.dispose();
          break;
        case 'error':
          reject(new TypeError('Network request failed'));
          hr.dispose();
          break;
        case 'timeout':
          reject(new TypeError('Network request timed out'));
          hr.dispose();
          break;
        case 'abort':
          reject(new TypeError('Network request aborted'));
          hr.dispose();
          break;
      }
    });
    hr.send({
      url: request.url,
      method: request.method,
      responseType: 'arraybuffer',
      data: typeof request._bodyInit === 'undefined' ? null : request._bodyInit,
      headers: encodeHeaders(request.headers),
      timeout: request.timeout
    });
  });
}

function encodeHeaders(headers) {
  var map = {};
  headers.forEach(function (value, name) { return map[name] = value; });
  return map;
}

if ( Object.assign === undefined ) {
	Object.assign = function (first) {
			var args = [], len = arguments.length - 1;
			while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

			args.map(function (obj) {
				for ( var p in obj ) {
					first[p] = obj[p];
				}
			});
		return first;
	};
}

var ROOT = typeof(window) !== "undefined" ? window : typeof(global) !== "undefined" ? global : new Function('return this')();
var _vendor = ['webkit', 'moz', 'ms', 'o'];
var animFrame = 'AnimationFrame';
var rafSuffixForVendor = 'Request' + animFrame;
var cafSuffixForVendor = 'Cancel' + animFrame;
var cafSuffixForVendor2 = 'CancelRequest' + animFrame;
var _timeout = setTimeout;
var _clearTimeout = clearTimeout;

if ( ROOT.requestAnimationFrame === undefined ) {

	var _raf, now, lastTime = Date.now(), frameMs = (50 / 3), fpsSec = frameMs;

	_vendor.map(function (vendor) {
		if ((_raf = ROOT[vendor + rafSuffixForVendor]) === undefined) {
			_raf = function (fn) {
				return _timeout(function () {
					now = Date.now();
					fn(now - lastTime);
					fpsSec = frameMs + (Date.now() - now);
				}, fpsSec);
			};
		}
	});

	if (_raf !== undefined) {
		ROOT.requestAnimationFrame = _raf;
	}
}

if ( ROOT.cancelAnimationFrame === undefined && (ROOT.cancelAnimationFrame = ROOT.cancelRequestAnimationFrame) === undefined ) {
	var _caf;

	_vendor.map(function (vendor) {
		if ((_caf = ROOT[vendor + cafSuffixForVendor]) === undefined && (_caf = ROOT[vendor + cafSuffixForVendor2]) === undefined) {
			_caf = function (fn) {
				return _clearTimeout(fn);
			};
		}
	});

	if (_caf !== undefined) {
		ROOT.cancelAnimationFrame = _caf;
	}
}

if ( Array.isArray === undefined ) {
	Array.isArray = function (arrayLike) {
		return arrayLike !== undefined && typeof arrayLike === "object" && arrayLike.length && arrayLike.push !== undefined && arrayLike.splice !== undefined;
	};
}

var _tweens = [];
var isStarted = false;
var _autoPlay = false;
var _tick;
var _events = {};
var root = typeof (window) !== "undefined" ? window : typeof (global) !== "undefined" ? global : {};

var autoPlay = function (state) {
	_autoPlay = state;
};

var emit = function(name, a, b, c, d, e) {
	var this$1 = this;

	var eventFn = _events[name];

	if (eventFn) {
		var i = eventFn.length;
		while (i--) {
			eventFn[i].call(this$1, a, b, c, d, e);
		}
	}
};

var off = function (ev, fn) {
	if (ev === undefined || _events[ev] === undefined) {
		return;
	}
	if (fn !== undefined) {
		var eventsList = _events[name]
			, i = 0;
		while (i < eventsList.length) {
			if (eventsList[i] === fn) {
				eventsList.splice(i, 1);
			}
			i++;
		}
	} else {
		_events[name] = [];
	}
};

var add = function (tween) {
	_tweens.push(tween);

	if (_autoPlay && !isStarted) {
		update();
		isStarted = true;
		emit('start');
	}
	emit('add', tween, _tweens);

};

var remove = function (tween) {
	_tweens.filter(function (tweens) { return tweens !== tween; });
	var i = 0
		, tweenFind;
	while (i < _tweens.length) {
		tweenFind = _tweens[i];
		if (tweenFind === tween) {
			emit('remove', tween, _tweens);
			_tweens.splice(i, 1);
		}
		i++;
	}
};

var now$1 = function () {
	if (typeof (process) !== "undefined" && process.hrtime !== undefined) {
		return function () {
			var time = process.hrtime();

			// Convert [seconds, nanoseconds] to milliseconds.
			return time[0] * 1000 + time[1] / 1000000;
		};
	}
	// In a browser, use window.performance.now if it is available.
	else if (root.performance !== undefined &&
		root.performance.now !== undefined) {

		// This must be bound, because directly assigning this function
		// leads to an invocation exception in Chrome.
		return root.performance.now.bind(root.performance)
	}
	// Use Date.now if it is available.
	else {
		var offset = root.performance && root.performance.timing && root.performance.timing.navigationStart ? root.performance.timing.navigationStart : Date.now();
		return function () {
			return Date.now() - offset;
		}
	}
}();

var update = function (time, preserve) {

	time = time !== undefined ? time : now$1();

	if (_autoPlay) {
		_tick = requestAnimationFrame(update);
	}
	emit('update', time, _tweens);

	if (_tweens.length === 0) {

		isStarted = false;
		cancelAnimationFrame(_tick);
		emit('stop', time);
		return false;

	}

	var i = 0;
	while (i < _tweens.length) {

		if (_tweens[i].update(time) || preserve) {
			i++;
		} else {
			_tweens.splice(i, 1);
		}

	}

	return true;
};

// Normalise time when visiblity is changed ...
if (root.document) {
	var doc = root.document, timeDiff = 0, timePause = 0;
	doc.addEventListener('visibilitychange', function (ev) {
		if (_tweens.length === 0) {
			return false;
		}
		if (document.hidden) {
			timePause = now$1();
		} else {
			timeDiff = now$1() - timePause;
			_tweens.map(function (tween) { return tween._startTime += timeDiff; });

		}
		return true;
	});
}

var Easing = {

	Linear: {

		None: function None( k ) {

			return k;

		}

	},

	Quadratic: {

		In: function In( k ) {

			return k * k;

		},

		Out: function Out( k ) {

			return k * ( 2 - k );

		},

		InOut: function InOut( k ) {

			if ( ( k *= 2 ) < 1 ) {
				return 0.5 * k * k;
			}

			return -0.5 * ( --k * ( k - 2 ) - 1 );

		}

	},

	Cubic: {

		In: function In( k ) {

			return k * k * k;

		},

		Out: function Out( k ) {

			return --k * k * k + 1;

		},

		InOut: function InOut( k ) {

			if ( ( k *= 2 ) < 1 ) {
				return 0.5 * k * k * k;
			}

			return 0.5 * ( ( k -= 2 ) * k * k + 2 );

		}

	},

	Quartic: {

		In: function In( k ) {

			return k * k * k * k;

		},

		Out: function Out( k ) {

			return 1 - ( --k * k * k * k );

		},

		InOut: function InOut( k ) {

			if ( ( k *= 2 ) < 1 ) {
				return 0.5 * k * k * k * k;
			}

			return -0.5 * ( ( k -= 2 ) * k * k * k - 2 );

		}

	},

	Quintic: {

		In: function In( k ) {

			return k * k * k * k * k;

		},

		Out: function Out( k ) {

			return --k * k * k * k * k + 1;

		},

		InOut: function InOut( k ) {

			if ( ( k *= 2 ) < 1 ) {
				return 0.5 * k * k * k * k * k;
			}

			return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );

		}

	},

	Sinusoidal: {

		In: function In( k ) {

			return 1 - Math.cos( k * Math.PI / 2 );

		},

		Out: function Out( k ) {

			return Math.sin( k * Math.PI / 2 );

		},

		InOut: function InOut( k ) {

			return 0.5 * ( 1 - Math.cos( Math.PI * k ) );

		}

	},

	Exponential: {

		In: function In( k ) {

			return k === 0 ? 0 : Math.pow( 1024, ( k - 1 ) );

		},

		Out: function Out( k ) {

			return k === 1 ? 1 : 1 - Math.pow( -10 * k, 2 );

		},

		InOut: function InOut( k ) {

			if ( k === 0 ) {
				return 0;
			}

			if ( k === 1 ) {
				return 1;
			}

			if ( ( k *= 2 ) < 1 ) {
				return 0.5 * Math.pow( 1024, ( k - 1 ) );
			}

			return 0.5 * ( -Math.pow( -10 * ( k - 1 ), 2 ) + 2 );

		}

	},

	Circular: {

		In: function In( k ) {

			return 1 - Math.sqrt( 1 - k * k );

		},

		Out: function Out( k ) {

			return Math.sqrt( 1 - ( --k * k ) );

		},

		InOut: function InOut( k ) {

			if ( ( k *= 2 ) < 1 ) {
				return -0.5 * ( Math.sqrt( 1 - k * k ) - 1 );
			}

			return 0.5 * ( Math.sqrt( 1 - ( k -= 2 ) * k ) + 1 );

		}

	},

	Elastic: {

		In: function In( k ) {

			if ( k === 0 ) {
				return 0;
			}

			if ( k === 1 ) {
				return 1;
			}

			return -Math.pow( ( 10 * ( k - 1 ) ), 2 ) * Math.sin( ( k - 1.1 ) * 5 * Math.PI );

		},

		Out: function Out( k ) {

			if ( k === 0 ) {
				return 0;
			}

			if ( k === 1 ) {
				return 1;
			}

			return Math.pow( -10 * k, 2 ) * Math.sin( ( k - 0.1 ) * 5 * Math.PI ) + 1;

		},

		InOut: function InOut( k ) {

			if ( k === 0 ) {
				return 0;
			}

			if ( k === 1 ) {
				return 1;
			}

			k *= 2;

			if ( k < 1 ) {
				return -0.5 * Math.pow( ( 10 * ( k - 1 ) ), 2 ) * Math.sin( ( k - 1.1 ) * 5 * Math.PI );
			}

			return 0.5 * Math.pow( -10 * ( k - 1 ), 2 ) * Math.sin( ( k - 1.1 ) * 5 * Math.PI ) + 1;

		}

	},

	Back: {

		In: function In( k ) {

			var s = 1.70158;

			return k * k * ( ( s + 1 ) * k - s );

		},

		Out: function Out( k ) {

			var s = 1.70158;

			return --k * k * ( ( s + 1 ) * k + s ) + 1;

		},

		InOut: function InOut( k ) {

			var s = 1.70158 * 1.525;

			if ( ( k *= 2 ) < 1 ) {
				return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
			}

			return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );

		}

	},

	Bounce: {

		In: function In( k ) {

			return 1 - Easing.Bounce.Out( 1 - k );

		},

		Out: function Out( k ) {

			if ( k < ( 1 / 2.75 ) ) {
				return 7.5625 * k * k;
			} else if ( k < ( 2 / 2.75 ) ) {
				return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
			} else if ( k < ( 2.5 / 2.75 ) ) {
				return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
			} else {
				return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
			}

		},

		InOut: function InOut( k ) {

			if ( k < 0.5 ) {
				return Easing.Bounce.In( k * 2 ) * 0.5;
			}

			return Easing.Bounce.Out( k * 2 - 1 ) * 0.5 + 0.5;

		}

	},

	Stepped: function Stepped( steps ) {
		return function( k ) {
			return Math.floor( k * steps ) / steps;
		}
	},

	Noisy: function Noisy( randomProportion, easingFunction ) {
		var normalProportion = 1.0 - randomProportion;
		return function( k ) {
			return randomProportion * Math.random() + normalProportion * easingFunction( k );
		}

	},

	// Credits:
	// @michaelvillar for dynamics.js easing/physics
	// Adapted by @dalisoft
	get bezier() {
			var b
				, d;
			b = function( b, d, g, f, h ) {
				var k = Math.pow( 1 - b, 3 )
					, l = 3 * Math.pow( 1 - b, 2 ) * b
					, m = 3 * ( 1 - b ) * Math.pow( b, 2 );
				b = Math.pow( b, 3 );
				return {
					x: k * d.x + l * g.x + m * f.x + b * h.x
					, y: k * d.y + l * g.y + m * f.y + b * h.y
				}
			};
			d = function( b, d ) {
				var g
					, f
					, h = 0
					, k = 0
					, l = d.length
					, m = 0
					, q = 1
					, w = ( q + m ) / 2;
				for ( g = null; k < l; ) {
					f = d[ k ];
					b >= f( 0 )
						.x && b <= f( 1 )
						.x && ( g = f );
					if ( null !== g )
						{ break; }
					k++;
				}
				if ( !g )
					{ return 1; }
				for ( f = g( w )
					.x; 1E-4 < Math.abs( b - f ) && 100 > h; )
					{ b > f ? m = w : q = w, w = ( q + m ) / 2, f = g( w )
					.x, h++; }
				return g( w )
					.y
			};
			return function( c ) {
				null == c && ( c = {} );
				var e = c.points
					, g = function() {
						var c
							, d = 0
							, k = e.length;
						g = [];
						for ( c = function( d, c ) {
								return g.push( function( e ) {
									return b( e, d, d.cp[ d.cp.length - 1 ], c.cp[ 0 ], c )
								} )
							}; d < k && !( d >= e.length - 1 ); )
							{ c( e[ d ], e[ d + 1 ] ), d++; }
						return g
					}
					();
				return function( b ) {
					return d( b, g )
				}
			}
		}
	, easeInOut: function easeInOut( b ) {
		var d
			, c;
		null == b && ( b = {} );
		d = null != ( c = b.friction ) ? c : Easing.easeInOut.defaults.friction;
		return Easing.bezier( {
			points: [ {
					x: 0
					, y: 0
					, cp: [ {
							x: .92 - d / 1E3
							, y: 0
							}
						]
					}, {
					x: 1
					, y: 1
					, cp: [ {
							x: .08 + d / 1E3
							, y: 1
							}
						]
					}
				]
		} )
	}
	, easeIn: function easeIn( b ) {
		var d
			, c;
		null == b && ( b = {} );
		d = null != ( c = b.friction ) ? c : Easing.easeIn.defaults.friction;
		return Easing.bezier( {
			points: [ {
					x: 0
					, y: 0
					, cp: [ {
							x: .92 - d / 1E3
							, y: 0
							}
						]
					}, {
					x: 1
					, y: 1
					, cp: [ {
							x: 1
							, y: 1
							}
						]
					}
				]
		} )
	}
	, easeOut: function easeOut( b ) {
		var d
			, c;
		null == b && ( b = {} );
		d = null != ( c = b.friction ) ? c : Easing.easeOut.defaults.friction;
		return Easing.bezier( {
			points: [ {
					x: 0
					, y: 0
					, cp: [ {
							x: 0
							, y: 0
							}
						]
					}, {
					x: 1
					, y: 1
					, cp: [ {
							x: .08 + d / 1E3
							, y: 1
							}
						]
					}
				]
		} )
	}
	, spring: function spring( b ) {
		var d
			, c
			, e
			, g
			, f;
		null == b && ( b = {} );
		Tools.extend( b, Easing.spring.defaults, true );
		e = Math.max( 1, b.frequency / 20 );
		g = Math.pow( 20, b.friction / 100 );
		f = b.anticipationSize / 1E3;
		d = function( d ) {
			var c
				, e;
			e = f / ( 1 - f );
			c = ( e - 0 ) / ( e - 0 );
			return ( .8 - c ) / e * d * b.anticipationStrength / 100 + c
		};
		c = function( b ) {
			return Math.pow( g / 10, -b ) * ( 1 - b )
		};
		return function( b ) {
			var g
				, l
				, m
				, q;
			q = b / ( 1 - f ) - f / ( 1 - f );
			b < f ? ( m = f / ( 1 - f ) - f / ( 1 - f ), g = 0 / ( 1 - f ) - f / (
					1 - f ), m = Math.acos(
					1 / d( m ) ), l = ( Math.acos( 1 / d( g ) ) - m ) / ( e * -f ), g =
				d ) : ( g = c, m = 0, l = 1 );
			return 1 - g( q ) * Math.cos( e * ( b - f ) * l + m )
		}
	}
	, bounce: function bounce( b ) {
		var d
			, c
			, e
			, g;
		null == b && ( b = {} );
		Tools.extend( b, Easing.bounce.defaults );
		e = Math.max( 1, b.frequency / 20 );
		g = Math.pow( 20, b.friction / 100 );
		d = function( b ) {
			return Math.pow( g / 10, -b ) * ( 1 - b )
		};
		c = function( b ) {
			return d( b ) * Math.cos( e * b * 1 + -1.57 )
		};
		c.initialForce = !0;
		return c
	}
	, gravity: function gravity( b ) {
		var d
			, c
			, e
			, g
			, f
			, h;
		null == b && ( b = {} );
		Tools.extend( b, Easing.gravity.defaults );
		c = Math.min( b.bounciness / 1250, .8 );
		g = b.elasticity / 1E3;
		e = [];
		d = function() {
				var e;
				e = Math.sqrt( .02 );
				e = {
					a: -e
					, b: e
					, H: 1
				};
				b.initialForce && ( e.a = 0, e.b *= 2 );
				for ( ; .001 < e.H; )
					{ d = e.b - e.a, e = {
						a: e.b
						, b: e.b + d * c
						, H: e.H * c * c
					}; }
				return e.b
			}
			();
		h = function( c, e, f, g ) {
			d = e - c;
			c = 2 / d * g - 1 - 2 * c / d;
			f = c * c * f - f + 1;
			b.initialForce && ( f = 1 - f );
			return f
		};
		( function() {
			var f
				, h
				, m;
			f = Math.sqrt( 2 / ( 100 * d * d ) );
			h = {
				a: -f
				, b: f
				, H: 1
			};
			b.initialForce && ( h.a = 0, h.b *= 2 );
			e.push( h );
			for ( m = []; 1 > h.b && .001 < h.H; )
				{ f = h.b - h.a, h = {
					a: h.b
					, b: h.b + f * c
					, H: h.H * g
				}
				, m.push( e.push( h ) ); }
			return m
		} )();
		f = function( c ) {
			var d
				, f;
			f = 0;
			for ( d = e[ f ]; !( c >= d.a && c <= d.b ) && ( f += 1, d = e[ f ], d ); ){  }
			return d ? h( d.a, d.b, d.H, c ) : b.initialForce ? 0 : 1
		};
		f.initialForce = b.initialForce;
		return f
	}
	, forceWithGravity: function forceWithGravity( b ) {
		null == b && ( b = {} );
		Tools.extend( b, Easing.forceWithGravity.defaults );
		b.initialForce = !0;
		return Easing.gravity( b )
	}

};

Easing.spring.defaults = {
	frequency: 300
	, friction: 200
	, anticipationSize: 0
	, anticipationStrength: 0
};
Easing.bounce.defaults = {
	frequency: 300
	, friction: 200
};
Easing.forceWithGravity.defaults = Easing.gravity.defaults = {
	bounciness: 400
	, elasticity: 200
};
Easing.easeInOut.defaults = Easing.easeIn.defaults = Easing.easeOut.defaults = {
	friction: 500
};

var Interpolation = {

	Linear: function Linear( v, k ) {

		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor( f );
		var fn = Interpolation.Utils.Linear;

		if ( k < 0 ) {
			return fn( v[ 0 ], v[ 1 ], f );
		}

		if ( k > 1 ) {
			return fn( v[ m ], v[ m - 1 ], m - f );
		}

		return fn( v[ i ], v[ i + 1 > m ? m : i + 1 ], f - i );

	},

	Bezier: function Bezier( v, k ) {

		var b = 0;
		var n = v.length - 1;
		var pw = Math.pow;
		var bn = Interpolation.Utils.Bernstein;

		for ( var i = 0; i <= n; i++ ) {
			b += pw( 1 - k, n - i ) * pw( k, i ) * v[ i ] * bn( n, i );
		}

		return b;

	},

	CatmullRom: function CatmullRom( v, k ) {

		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor( f );
		var fn = Interpolation.Utils.CatmullRom;

		if ( v[ 0 ] === v[ m ] ) {

			if ( k < 0 ) {
				i = Math.floor( f = m * ( 1 + k ) );
			}

			return fn( v[ ( i - 1 + m ) % m ], v[ i ], v[ ( i + 1 ) % m ], v[ ( i + 2 ) % m ], f - i );

		} else {

			if ( k < 0 ) {
				return v[ 0 ] - ( fn( v[ 0 ], v[ 0 ], v[ 1 ], v[ 1 ], -f ) - v[ 0 ] );
			}

			if ( k > 1 ) {
				return v[ m ] - ( fn( v[ m ], v[ m ], v[ m - 1 ], v[ m - 1 ], f - m ) - v[ m ] );
			}

			return fn( v[ i ? i - 1 : 0 ], v[ i ], v[ m < i + 1 ? m : i + 1 ], v[ m < i + 2 ? m : i + 2 ], f - i );

		}

	},

	Utils: {

		Linear: function Linear( p0, p1, t ) {

			return ( p1 - p0 ) * t + p0;

		},

		Bernstein: function Bernstein( n, i ) {

			var fc = Interpolation.Utils.Factorial;

			return fc( n ) / fc( i ) / fc( n - i );

		},

		Factorial: ( ( function () {

			var a = [ 1 ];

			return function (n) {

				var s = 1;

				if ( a[ n ] ) {
					return a[ n ];
				}

				for ( var i = n; i > 1; i-- ) {
					s *= i;
				}

				a[ n ] = s;
				return s;

			};

		} ) )(),

		CatmullRom: function CatmullRom( p0, p1, p2, p3, t ) {

			var v0 = ( p2 - p0 ) * 0.5;
			var v1 = ( p3 - p1 ) * 0.5;
			var t2 = t * t;
			var t3 = t * t2;

			return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( -3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;

		}

	}
};

function cloneTween(obj, configs, Constructor_Ex) {
    if ( obj === void 0 ) obj = {};
    if ( configs === void 0 ) configs = {};
    if ( Constructor_Ex === void 0 ) Constructor_Ex = Tween;

    var copyTween = new Constructor_Ex();
	for ( var config in obj ) {
		if (configs[config] !== undefined) {
		copyTween[config] = configs[config];
		} else {
		copyTween[config] = obj[config];
		}
	}
	return copyTween;
}

function joinToString (__array__like) {
	var str = '';
	for ( var i = 0, len = __array__like.length; i < len; i++ ) {
		str += __array__like[i];
	}
	return str;
}

function toNumber(val) {
	var floatedVal = parseFloat(val);
	return typeof floatedVal === "number" && !isNaN(floatedVal) ? floatedVal : val;
}

// Credits:
// @jkroso for string parse library
// Optimized, Extended by @dalisoft
var Number_Match_RegEx = /\s+|([A-Za-z?().,{}:""\[\]#]+)|([-+\/*%]+=)?([-+*\/%]+)?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/gi;

var Tween = function Tween(object, instate) {
    if ( object === void 0 ) object = {};


    this.object = object;
    this._valuesStart = Tween.createEmptyConst(object);
    this._valuesEnd = Tween.createEmptyConst(object);

    this._duration = 1000;
    this._easingFunction = Easing.Linear.None;
    this._interpolationFunction = Interpolation.None;

    this._startTime = 0;
    this._delayTime = 0;
    this._repeat = 0;
    this._r = null;
    this._isPlaying = false;
    this._yoyo = false;
    this._reversed = null;

    this._onStartCallbackFired = false;
    this._pausedTime = null;

    if (instate && instate.to) {

        return new Tween(object).to(instate.to, instate);

    }

    return this;

};
Tween.createEmptyConst = function createEmptyConst (oldObject) {
    return typeof(oldObject) === "number" ? 0 : Array.isArray(oldObject) ? [] : typeof(oldObject) === "object" ? {} :
        '';
};
Tween.checkValidness = function checkValidness (valid) {
    return valid !== undefined && valid !== null && valid !== '' && valid !== NaN && valid !== Infinity;
};
Tween.prototype.isPlaying = function isPlaying () {
    return this._isPlaying;
};
Tween.prototype.isStarted = function isStarted () {
    return this._onStartCallbackFired;
};
Tween.prototype.reverse = function reverse () {

    var ref = this;
        var _reversed = ref._reversed;

    this._reversed = !_reversed;

    return this;
};
Tween.prototype.reversed = function reversed () {
    return this._reversed;
};
Tween.prototype.off = function off$$1 (name, fn) {
    if (!(this._events && this._events[name] !== undefined)) {
            return this;
        }
        if (name !== undefined && fn !== undefined) {
            var eventsList = this._events[name],
                i = 0;
            while (i < eventsList.length) {
                if (eventsList[i] === fn) {
                    eventsList.splice(i, 1);
                }
                i++;
            }
        } else if (name !== undefined && fn === undefined) {
            this._events[name] = [];
        }
        return this;
    };
    Tween.prototype.on = function on$$1 (name, fn) {
        if (!(this._events && this._events[name] !== undefined)) {
			if (!this._events) {
				this._events = {};
			}
            this._events[name] = [];
        }
        this._events[name].push(fn);
        return this;
    };
    Tween.prototype.once = function once$$1 (name, fn) {
            var this$1 = this;

        if (!(this._events && this._events[name] !== undefined)) {
			if (!this._events) {
				this._events = {};
			}
            this._events[name] = [];
        }
        return this.on(name, function () {
                var args = [], len = arguments.length;
                while ( len-- ) args[ len ] = arguments[ len ];

            fn.call.apply(fn, [ this$1 ].concat( args ));
            this$1.off(name);
        });
    };
    Tween.prototype.emit = function emit$$1 (name, a, b, c, d, e) {
            var this$1 = this;


        var ref = this;
            var _events = ref._events;

			if (!_events) {
				return this;
			}

        var eventFn = _events[name];

        if (!eventFn) {
            return this;
        }

        var i = eventFn.length;
        while (i--) {
            eventFn[i].call(this$1, a, b, c, d, e);
        }
        return this;

    };
    Tween.prototype.pause = function pause () {

        if (!this._isPlaying) {
            return this;
        }

        this._isPlaying = false;

        remove(this);
        this._pausedTime = now$1();

        return this.emit('pause', this.object);
    };
    Tween.prototype.play = function play () {

        if (this._isPlaying) {
            return this;
        }

        this._isPlaying = true;

        this._startTime += now$1() - this._pausedTime;
        add(this);
        this._pausedTime = now$1();

        return this.emit('play', this.object);
    };
    Tween.prototype.restart = function restart (noDelay) {

        this._repeat = this._r;
        this._startTime = now$1() + (noDelay ? 0 : this._delayTime);

        if (!this._isPlaying) {
            add(this);
        }

        return this.emit('restart', this._object);

    };
    Tween.prototype.seek = function seek (time, keepPlaying) {

        this._startTime = now$1() + Math.max(0, Math.min(
            time, this._duration));

        this.emit('seek', time, this._object);

        return keepPlaying ? this : this.pause();

    };
    Tween.prototype.duration = function duration (amount) {

        this._duration = typeof(amount) === "function" ? amount(this._duration) : amount;

        return this;
    };
    Tween.prototype.to = function to (properties, duration) {
            var this$1 = this;
            if ( properties === void 0 ) properties = {};
            if ( duration === void 0 ) duration = 1000;


        if (typeof properties === "number") {
            var _vE = {
                Number: properties
            };
            this._valuesEnd = _vE;
        } else {
            this._valuesEnd = properties;
        }

        if (typeof duration === "number") {
            this._duration = typeof(duration) === "function" ? duration(this._duration) : duration;
        } else if (typeof duration === "object") {
            for (var prop in duration) {
                if (this$1[prop]) {
                    this$1[prop](typeof duration[prop] === "function" ? duration[prop](this$1._duration) : duration);
                }
            }
        }

        return this;

    };
    Tween.prototype.start = function start (time) {
            var this$1 = this;


        var ref = this;
            var _startTime = ref._startTime;
            var _delayTime = ref._delayTime;
            var _valuesEnd = ref._valuesEnd;
            var _valuesStart = ref._valuesStart;
            var object = ref.object;

        _startTime = time !== undefined ? time : now$1();
        _startTime += _delayTime;

        this._startTime = _startTime;

        for (var property in _valuesEnd) {

            if (typeof _valuesEnd[property] === "object") {
                if (Array.isArray(_valuesEnd[property])) {
                    if (typeof object[property] === "number") {
                        this$1._valuesEnd[property] = [object[property]].concat(_valuesEnd[property]);
                    } else {
                        var clonedTween = cloneTween(this$1, {
                                object: object[property],
                                _valuesEnd: _valuesEnd[property],
                                _events: undefined
                            })
                            .start()
                            .stop();

                        this$1._valuesEnd[property] = clonedTween;
                    }
                } else {
                    var clonedTween$1 = cloneTween(this$1, {
                            object: object[property],
                            _valuesEnd: _valuesEnd[property],
                            _events: undefined
                        })
                        .start()
                        .stop();

                    this$1._valuesStart[property] = 1;
                    this$1._valuesEnd[property] = clonedTween$1;
                }
            } else if (typeof _valuesEnd[property] === "string" && typeof object[property] === "string" && Number_Match_RegEx.test(object[property]) && Number_Match_RegEx.test(_valuesEnd[property])) {

                var _get__Start = object[property].match(Number_Match_RegEx);
                _get__Start = _get__Start.map(toNumber);
                var _get__End = _valuesEnd[property].match(Number_Match_RegEx);
                _get__End = _get__End.map(toNumber);
                var clonedTween$2 = cloneTween(this$1, {
                        object: _get__Start,
                        _valuesEnd: _get__End,
                        _events: {}
                    })
                    .start()
                    .stop();

                clonedTween$2.join = true; // For string tweening
                this$1._valuesStart[property] = 1;
                this$1._valuesEnd[property] = clonedTween$2;

            }

            // If value presented as function,
            // we should convert to value again by passing function
            if (typeof object[property] === "function") {
                object[property] = this$1.object[property] = object[property](this$1);
            }

            if (typeof _valuesEnd[property] === "function") {
                this$1._valuesEnd[property] = _valuesEnd[property](this$1);
            }

            // If `to()` specifies a property that doesn't exist in the source object,
            // we should not set that property in the object
            if (Tween.checkValidness(object[property]) === false) {
                continue;
            }

            // If duplicate or non-tweening numerics matched,
            // we should skip from adding to _valuesStart
            if (object[property] === _valuesEnd[property]) {
                continue;
            }

            this$1._valuesStart[property] = object[property];

        }

        add(this);

        this._isPlaying = true;

        return this;

    };
    Tween.prototype.stop = function stop () {

        var ref = this;
            var _isPlaying = ref._isPlaying;
            var object = ref.object;

        if (!_isPlaying) {
            return this;
        }

        remove(this);
        this._isPlaying = false;

        this.stopChainedTweens();
        return this.emit('stop', object);

    };
    Tween.prototype.end = function end () {

        var ref = this;
            var _startTime = ref._startTime;
            var _duration = ref._duration;

        return this.update(_startTime + _duration);

    };
    Tween.prototype.stopChainedTweens = function stopChainedTweens () {

        var ref = this;
            var _chainedTweens = ref._chainedTweens; if ( _chainedTweens === void 0 ) _chainedTweens = [];

        _chainedTweens.map(function (item) { return item.stop(); });

        return this;

    };
    Tween.prototype.delay = function delay (amount) {

        this._delayTime = typeof(amount) === "function" ? amount(this._delayTime) : amount;

        return this;

    };
    Tween.prototype.repeat = function repeat (amount) {

        this._repeat = typeof(amount) === "function" ? amount(this._repeat) : amount;
        this._r = this._repeat;

        return this;

    };
    Tween.prototype.repeatDelay = function repeatDelay (amount) {

        this._repeatDelayTime = typeof(amount) === "function" ? amount(this._repeatDelayTime) : amount;

        return this;

    };
    Tween.prototype.reverseDelay = function reverseDelay (amount) {

        this._reverseDelayTime = typeof(amount) === "function" ? amount(this._reverseDelayTime) : amount;

        return this;

    };
    Tween.prototype.yoyo = function yoyo (state) {

        this._yoyo = typeof(state) === "function" ? state(this._yoyo) : state;

        return this;

    };
    Tween.prototype.easing = function easing (fn) {

        this._easingFunction = fn;

        return this;

    };
    Tween.prototype.interpolation = function interpolation (fn) {

        this._interpolationFunction = fn;

        return this;

    };
    Tween.prototype.chain = function chain () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];


        this._chainedTweens = args;

        return this;

    };
    Tween.prototype.get = function get (time) {
        this.update(time);
        return this.object;
    };
    Tween.prototype.update = function update$$1 (time) {
            var this$1 = this;


        var ref = this;
            var _onStartCallbackFired = ref._onStartCallbackFired;
            var _chainedTweens = ref._chainedTweens;
            var _easingFunction = ref._easingFunction;
            var _interpolationFunction = ref._interpolationFunction;
            var _repeat = ref._repeat;
            var _repeatDelayTime = ref._repeatDelayTime;
            var _reverseDelayTime = ref._reverseDelayTime;
            var _delayTime = ref._delayTime;
            var _yoyo = ref._yoyo;
            var _reversed = ref._reversed;
            var _startTime = ref._startTime;
            var _duration = ref._duration;
            var _valuesStart = ref._valuesStart;
            var _valuesEnd = ref._valuesEnd;
            var object = ref.object;

        var property;
        var elapsed;
        var value;

        time = time !== undefined ? time : now$1();

        if (time < _startTime) {
            return true;
        }

        if (!_onStartCallbackFired) {

            this.emit('start', object);

            this._onStartCallbackFired = true;
        }

        elapsed = (time - _startTime) / _duration;
        elapsed = elapsed > 1 ? 1 : elapsed;
        elapsed = _reversed ? 1 - elapsed : elapsed;

        value = _easingFunction(elapsed);

        for (property in _valuesEnd) {

            // Don't update properties that do not exist in the source object
            if (_valuesStart[property] === undefined) {
                continue;
            }

            var start = _valuesStart[property];
            var end = _valuesEnd[property];

            if (end instanceof Tween) {

                var getValue = end.get(time);

                if (end.join) {

                    object[property] = joinToString(getValue);

                } else {

                    object[property] = getValue;

                }

            } else if (Array.isArray(end)) {

                object[property] = _interpolationFunction(end, value);

            } else if (typeof(end) === 'string') {

                if (end.charAt(0) === '+' || end.charAt(0) === '-') {
                    end = start + parseFloat(end);
                } else {
                    end = parseFloat(end);
                }

                // Protect against non numeric properties.
                if (typeof(end) === 'number') {
                    object[property] = start + (end - start) * value;
                }
            } else if (typeof(end) === 'number') {
                object[property] = start + (end - start) * value;
            }

        }

        this.emit('update', object, value, elapsed);

        if (elapsed === 1 || (_reversed && elapsed === 0)) {

            if (_repeat) {

                if (isFinite(_repeat)) {
                    this._repeat--;
                }

                for (property in _valuesEnd) {

                    if (typeof(_valuesEnd[property]) === 'string' && typeof(_valuesStart[property]) === 'number') {
                        this$1._valuesStart[property] = _valuesStart[property] + parseFloat(_valuesEnd[property]);
                    }

                }

                // Reassign starting values, restart by making startTime = now
                this.emit(_reversed ? 'reverse' : 'repeat', object);

                if (_yoyo) {
                    this._reversed = !_reversed;
                }

                if (!_reversed && _repeatDelayTime) {
                    this._startTime += _duration + _repeatDelayTime;
                } else if (_reversed && _reverseDelayTime) {
                    this._startTime += _duration + _reverseDelayTime;
                } else {
                    this._startTime += _duration;
                }

                return true;

            } else {

                this.emit('complete', object);

                if (_chainedTweens) {
                    _chainedTweens.map(function (tween) { return tween.start(_startTime + _duration); });
                }

                return false;

            }
        }
        return true;
    };

var cache = {
	filter: {
		grayscale: 1,
		brightness: 1,
		sepia: 1,
		invert: 1,
		saturate: 1,
		contrast: 1,
		blur: 1,
		hueRotate: 1,
		dropShadow: 1
	},
	transform: {
		translate: 1,
		translateX: 1,
		translateY: 1,
		translateZ: 1,
		rotate: 1,
		rotateX: 1,
		rotateY: 1,
		rotateZ: 1,
		scale: 1,
		scaleX: 1,
		scaleY: 1,
		scaleZ: 1,
		skew: 1,
		skewX: 1,
		skewY: 1
	}
};

var Plugins = function Plugins () {};

Plugins.DOM = function DOM (Composite) {
	var layer = Composite.domNode,
	style = layer.style;
	return {
		update: function update(Tween, RenderObject) {
			for (var p in RenderObject) {
				style[p] = RenderObject[p];
			}
		}
	}
};
Plugins.Transform = function Transform (Composite) {
	var layer = Composite.domNode,
	style = layer.style;
	return {
		update: function update(Tween, RenderObject) {
			var transform = '';
			for (var p in RenderObject) {
				if (p === 'x' || p === 'y' || p === 'z') {
					transform += ' translate3d( ' + (RenderObject.x || '0px') + ', ' + (RenderObject.y || '0px') + ', ' + (RenderObject.z || '0px') + ')';
				} else if (cache.transform[p]) {
					transform += " " + p + "( " + (RenderObject[p]) + ")";
				}
			}
			if (transform) {
				style.transform = transform;
			}
		}
	}
};
Plugins.Filter = function Filter (Composite) {
	var layer = Composite.domNode,
	style = layer.style;
	return {
		update: function update(Tween, RenderObject) {
			var filter = '';
			for (var p in RenderObject) {
				if (cache.filter[p]) {
					filter += " " + p + "( " + (RenderObject[p]) + ")";
				}
			}
			if (filter) {
				style.webkitFilter = style.filter = filter;
			}
		}
	}
};
Plugins.Scroll = function Scroll (Composite) {
	var layer = Composite.domNode;
	return {
		update: function (Tween, RenderObject) {
			for (var p in RenderObject) {
				layer[p] = RenderObject[p];
			}
		}
	}
};

var Composite$2 = function Composite(domNode) {

	var self = this;

	this.domNode = domNode;
	this.plugins = {};
	var pluginList = this.plugins;

	this.render = function (object) {
		var this$1 = this;


		for (var p in pluginList) {

			pluginList[p] && pluginList[p].update && pluginList[p].update(this$1, object);

		}

		return this;
	};

	this.fetch = function () {
		var this$1 = this;


		if (Object.keys(this.object).length) {

			return this;

		}

		for (var p in pluginList) {

			pluginList[p] && pluginList[p].fetch && pluginList[p].fetch(this$1);

		}

		return this;
	};

	this.init = function (object) {
		var this$1 = this;


		for (var p in pluginList) {

			pluginList[p] && pluginList[p].init && pluginList[p].init(this$1, object);

		}

		return this;
	};

	return this;
};

var prototypeAccessors$7 = { object: {} };
Composite$2.prototype.applyPlugin = function applyPlugin (name) {
	if (Plugins[name] !== undefined) {
		this.plugins[name] = Plugins[name](this);
	}
	return this;
};
prototypeAccessors$7.object.set = function (obj) {
	return this.render(obj);
};
Composite$2.prototype.cloneLayer = function cloneLayer () {
	return cloneTween(this, {}, Composite$2)
};
Composite$2.prototype.appendTo = function appendTo (node) {
	node.appendChild(this.domNode);
	return this;
};

Object.defineProperties( Composite$2.prototype, prototypeAccessors$7 );

var Timeline = function Timeline () {
	this._private = {
		tweens: [],
		fullTime: 0
	};
	return this;
};
Timeline.prototype.add = function add (tween) {
		var this$1 = this;

	if (tween instanceof Tween) {
		this._private.tweens.push(tween);
	} else if (!Array.isArray(tween) && typeof tween === "object") {
		var tweenExample = new Tween({x:0});
			for ( var p in tween ) {
				tweenExample[p](tween[p]);
			}
		this.add(tweenExample);
	} else if (typeof tween === "object") {
		tween.map(function (add) {
			this$1.add(add);
		});
	}
	return this;
};
Timeline.prototype.start = function start () {
		var this$1 = this;

	this._private.tweens.map(function (tween) {
		tween.start(this$1._private.fullTime);
	});
	this._private.fullTime = Math.max.apply(0, this._private.tweens.reduce(function (prev, curr) {
		return curr._duration > prev ? curr._duration : prev;
	}, 0));
	return this;
};

/* Shims will be deprecated in next update, please update browser */

autoPlay(true);

var window$1 = global.window;

Object.assign(window$1, {
  Crypto: Crypto,
  ImageData: ImageData,
  ProgressEvent: ProgressEvent,
  Storage: Storage,
  WebSocket: WebSocket,
  XMLHttpRequest: XMLHttpRequest,
  fetch: fetch,
  Headers: Headers,
  Request: Request,
  Response: Response,
  JSX: JSX
});

addDOMDocument(window$1);
addDOMEventTargetMethods(window$1);
addWindowTimerMethods(window$1);
addAnimationFrame(window$1);
addSVGSupport(window$1);

var tabris$1 = global.tabris = Object.assign(new Tabris(), {
  Action: Action,
  ActivityIndicator: ActivityIndicator,
  AlertDialog: AlertDialog,
  App: App,
  Button: Button,
  Canvas: Canvas,
  CheckBox: CheckBox,
  CollectionView: CollectionView,
  Composite: Composite,
  Component: Component,
  ContentView: ContentView,
  View: Composite,
  Crypto: Crypto,
  Device: Device,
  Drawer: Drawer,
  Event: Event,
  FileSystem: FileSystem,
  ImageData: ImageData,
  ImageView: ImageView,
  InactivityTimer: InactivityTimer,
  NativeObject: NativeObject,
  NavigationView: NavigationView,
  NavigationBar: NavigationBar,
  Page: Page,
  Picker: Picker,
  ProgressBar: ProgressBar,
  ProgressEvent: ProgressEvent,
  RadioButton: RadioButton,
  ScrollView: ScrollView,
  SearchAction: SearchAction,
  Slider: Slider,
  Storage: Storage,
  StatusBar: StatusBar,
  Switch: Switch,
  Tab: Tab,
  TabFolder: TabFolder,
  TextInput: TextInput,
  TextView: TextView,
  ToggleButton: ToggleButton,
  ui: Ui,
  Video: Video,
  WebSocket: WebSocket,
  WebView: WebView,
  Widget: Widget,
  WidgetCollection: WidgetCollection,
  XMLHttpRequest: XMLHttpRequest,
  fetch: fetch,
  Headers: Headers,
  Request: Request,
  Response: Response,
  Tween: Tween,
  Easing: Easing,
  Interpolation: Interpolation,
  window: window$1
});



tabris$1.on('start', function () {
  tabris$1.app = create$1();
  checkVersion(tabris$1.version, tabris$1.app._nativeGet('tabrisJsVersion'));
  tabris$1.ui = create$2();
  tabris$1.device = create();
  tabris$1.fs = create$7();
  publishDeviceProperties(tabris$1.device, window$1);
  window$1.localStorage = tabris$1.localStorage = create$8();
  if (tabris$1.device.platform === 'iOS') {
    window$1.secureStorage = tabris$1.secureStorage = create$8(true);
  }
  window$1.crypto = tabris$1.crypto = new Crypto();
  tabris$1.pkcs5 = new Pkcs5();
});

return tabris$1;

})));
//# sourceMappingURL=tabris.js.map
