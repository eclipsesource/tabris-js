import {types} from './property-types';
import {warn, debug} from './Console';
import EventObject from './EventObject';
import Events from './Events';
import Listeners from './Listeners';

function EventsClass() {}
Object.assign(EventsClass.prototype, Events);

export default class NativeObject extends EventsClass {

  /**
   * @param {object} target
   * @param {PropertyDefinitions} definitions
   */
  static defineProperties(target, definitions) {
    for (let name in definitions) {
      NativeObject.defineProperty(target, name, definitions[name]);
    }
  }

  static defineProperty(target, name, definition) {
    target['$prop_' + name] = normalizeProperty(definition);
    Object.defineProperty(target, name, {
      set(value) {
        this.$setProperty(name, value);
      },
      get() {
        return this.$getProperty(name);
      }
    });
    if (typeof definition !== 'object' || !definition.const) {
      this.defineEvent(target, name + 'Changed', true);
    }
  }

  /**
   * @param {object} target
   * @param {EventDefinitions} definitions
   */
  static defineEvents(target, definitions) {
    for (let name in definitions) {
      NativeObject.defineEvent(target, name, definitions[name]);
    }
  }

  static defineEvent(target, name, definition) {
    const property = 'on' + name.charAt(0).toUpperCase() + name.slice(1);
    const $property = '$' + property;
    Object.defineProperty(target, property, {
      get() {
        if (!this[$property]) {
          this[$property] = new Listeners(this, name);
        }
        return this[$property];
      }
    });
    if (typeof definition === 'object') {
      if (definition.native) {
        target['$listen_' + name] = function(listening) {
          this._nativeListen(name, listening);
        };
      }
      if (definition.changes) {
        const prop = definition.changes;
        target['$listen_' + prop + 'Changed'] = function(listening) {
          this._onoff(name, listening, ev => this._triggerChangeEvent(prop, ev[definition.changeValue || prop]));
        };
      }
    }
  }

  static extend(nativeType, superType = NativeObject) {
    return class extends superType {
      constructor(properties) {
        super();
        this._create(nativeType, properties || {});
      }
    };
  }

  constructor() {
    super();
    if (this.constructor === NativeObject) {
      throw new Error('Cannot instantiate abstract NativeObject');
    }
    this._register();
  }

  set(properties) {
    if (arguments.length > 1) {
      throw new Error('Too many arguments');
    }
    this._reorderProperties(Object.keys(properties)).forEach(function(name) {
      setExistingProperty.call(this, name, properties[name]);
    }, this);
    return this;
  }

  $getProperty(name) {
    if (this._isDisposed) {
      warn('Cannot get property "' + name + '" on disposed object');
      return;
    }
    let getter = this.$getPropertyGetter(name) || this._getStoredProperty;
    let value = getter.call(this, name);
    return this._decodeProperty(this._getTypeDef(name), value);
  }

  $setProperty(name, value) {
    if (this._isDisposed) {
      warn('Cannot set property "' + name + '" on disposed object');
      return;
    }
    let typeDef = this._getTypeDef(name);
    let encodedValue;
    try {
      encodedValue = this._encodeProperty(typeDef, value);
    } catch (ex) {
      warn(this + ': Ignored unsupported value for property "' + name + '": ' + ex.message);
      return;
    }
    let setter = this.$getPropertySetter(name) || this._storeProperty;
    setter.call(this, name, encodedValue);
  }

  _register() {
    if (typeof tabris === 'undefined' || !tabris._nativeBridge) {
      throw new Error('tabris.js not started');
    }
    const cid = tabris._proxies.register(this);
    Object.defineProperty(this, 'cid', {value: cid});
  }

  _storeProperty(name, encodedValue) {
    let oldEncodedValue = this._getStoredProperty(name);
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
  }

  _getStoredProperty(name) {
    let result = this._props ? this._props[name] : undefined;
    if (result === undefined) {
      result = this._getDefaultPropertyValue(name);
    }
    return result;
  }

  _getTypeDef(name) {
    let prop = this['$prop_' + name];
    return prop ? prop.type : null;
  }

  _getDefaultPropertyValue(name) {
    let prop = this['$prop_' + name];
    return prop ? valueOf(prop.default) : undefined;
  }

  _encodeProperty(typeDef, value) {
    return (typeDef && typeDef.encode) ? typeDef.encode(value) : value;
  }

  _decodeProperty(typeDef, value) {
    return (typeDef && typeDef.decode) ? typeDef.decode(value) : value;
  }

  $getPropertyGetter(name) {
    let prop = this['$prop_' + name];
    return prop ? prop.get : undefined;
  }

  $getPropertySetter(name) {
    let prop = this['$prop_' + name];
    return prop ? prop.set : undefined;
  }

  _triggerChangeEvent(propertyName, newEncodedValue) {
    let typeDef = this._getTypeDef(propertyName);
    let decodedValue = this._decodeProperty(typeDef, newEncodedValue);
    this.$trigger(propertyName + 'Changed', {value: decodedValue});
  }

  _create(type, properties = {}) {
    tabris._nativeBridge.create(this.cid, type);
    this._reorderProperties(Object.keys(properties)).forEach(function(name) {
      setExistingProperty.call(this, name, properties[name]);
    }, this);
    return this;
  }

  _reorderProperties(properties) {
    return properties;
  }

  dispose() {
    this._dispose();
  }

  _dispose(skipNative) {
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
  }

  _release() {
  }

  isDisposed() {
    return !!this._isDisposed;
  }

  _listen(name, listening) {
    const listenHandler = this['$listen_' + name];
    if (listenHandler) {
      listenHandler.call(this, listening);
    }
  }

  _nativeListen(event, state) {
    this._checkDisposed();
    tabris._nativeBridge.listen(this.cid, event, state);
  }

  _trigger(name, eventData = {}) {
    return this.$trigger(name, eventData);
  }

  $trigger(name, eventData = {}) {
    let event = new EventObject();
    for (let key in eventData) {
      if (!(key in event)) {
        Object.defineProperty(event, key, {enumerable: true, value: eventData[key]});
      }
    }
    this.trigger(name, event);
    return !!event.defaultPrevented;
  }

  _onoff(name, listening, listener) {
    listening ? this.on(name, listener) : this.off(name, listener);
  }

  _checkDisposed() {
    if (this._isDisposed) {
      throw new Error('Object is disposed');
    }
  }

  _nativeSet(name, value) {
    this._checkDisposed();
    tabris._nativeBridge.set(this.cid, name, value);
  }

  _nativeGet(name) {
    this._checkDisposed();
    return tabris._nativeBridge.get(this.cid, name);
  }

  _nativeCall(method, parameters) {
    this._checkDisposed();
    return tabris._nativeBridge.call(this.cid, method, parameters);
  }

  toString() {
    return this.constructor.name;
  }

}

NativeObject.defineEvents(NativeObject.prototype, {
  dispose: true
});

function setExistingProperty(name, value) {
  if (!(name in this)) {
    debug('Setting undefined property "' + name + '"');
  }
  this[name] = value;
}

function normalizeProperty(property) {
  let config = typeof property === 'string' ? {type: property} : property;
  return {
    type: resolveType(config.type || 'any'),
    default: config.default,
    const: config.const,
    nocache: config.nocache,
    set: config.readonly && readOnlySetter || config.set || defaultSetter,
    get: config.get || defaultGetter
  };
}

function resolveType(type) {
  let typeDef = type;
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
    let args = type.slice(1);
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
  warn(`Can not set read-only property "${name}"`);
}

function defaultSetter(name, value) {
  this._nativeSet(name, value === undefined ? null : value);
  if (this['$prop_' + name].nocache) {
    this._triggerChangeEvent(name, value);
  } else {
    this._storeProperty(name, value);
  }
}

function defaultGetter(name) {
  let result = this._getStoredProperty(name);
  if (result === undefined) {
    // TODO: cache read property, but not for device properties
    result = this._nativeGet(name);
  }
  return result;
}

function valueOf(value) {
  return value instanceof Function ? value() : value;
}
