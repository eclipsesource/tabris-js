import {types} from './property-types';
import Events from './Events';

function EventsClass() {}
Object.assign(EventsClass.prototype, Events);

export default class NativeObject extends EventsClass {

  static defineProperties(target, definitions) {
    for (let name in definitions) {
      NativeObject.defineProperty(target, name, definitions[name]);
    }
  }

  static defineProperty(target, name, definition) {
    target['$prop_' + name] = normalizeProperty(definition);
    Object.defineProperty(target, name, {
      set(value) {
        this._setProperty(name, value);
      },
      get() {
        return this._getProperty(name);
      }
    });
  }

  static extend(nativeType, superType = NativeObject) {
    return class extends superType {
      constructor(properties) {
        super();
        this._create(nativeType, properties || {});
      }
    };
  }

  constructor(cid) {
    super();
    if (!tabris._nativeBridge) {
      throw new Error('tabris.js not started');
    }
    if (this.constructor === NativeObject) {
      throw new Error('Cannot instantiate abstract NativeObject');
    }
    cid = tabris._proxies.register(this, cid);
    Object.defineProperty(this, 'cid', {value: cid});
  }

  set(arg1, arg2) {
    if (typeof arg1 === 'string') {
      setExistingProperty.call(this, arg1, arg2);
    } else {
      this._reorderProperties(Object.keys(arg1)).forEach(function(name) {
        setExistingProperty.call(this, name, arg1[name]);
      }, this);
    }
    return this;
  }

  get(name) {
    return this[name];
  }

  _getProperty(name) {
    if (this._isDisposed) {
      console.warn('Cannot get property "' + name + '" on disposed object');
      return;
    }
    let getter = this._getPropertyGetter(name) || this._getStoredProperty;
    let value = getter.call(this, name);
    return this._decodeProperty(this._getTypeDef(name), value);
  }

  _setProperty(name, value) {
    if (this._isDisposed) {
      console.warn('Cannot set property "' + name + '" on disposed object');
      return;
    }
    let typeDef = this._getTypeDef(name);
    let encodedValue;
    try {
      encodedValue = this._encodeProperty(typeDef, value);
    } catch (ex) {
      console.warn(this + ': Ignored unsupported value for property "' + name + '": ' + ex.message);
      return;
    }
    let setter = this._getPropertySetter(name) || this._storeProperty;
    setter.call(this, name, encodedValue);
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

  _getPropertyGetter(name) {
    let prop = this['$prop_' + name];
    return prop ? prop.get : undefined;
  }

  _getPropertySetter(name) {
    let prop = this['$prop_' + name];
    return prop ? prop.set : undefined;
  }

  _triggerChangeEvent(propertyName, newEncodedValue) {
    let typeDef = this._getTypeDef(propertyName);
    let decodedValue = this._decodeProperty(typeDef, newEncodedValue);
    this.trigger('change:' + propertyName, {target: this, value: decodedValue});
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
      this.trigger('dispose', {target: this});
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

  _listen(/* name, listening */) {
  }

  _nativeListen(event, state) {
    this._checkDisposed();
    tabris._nativeBridge.listen(this.cid, event, state);
  }

  _trigger(name, event = {}) {
    this.trigger(name, Object.assign({target: this}, event));
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

function setExistingProperty(name, value) {
  if (name in this) {
    this[name] = value;
  } else {
    console.warn('Unknown property "' + name + '"');
  }
}

function normalizeProperty(property) {
  let config = typeof property === 'string' ? {type: property} : property;
  return {
    type: resolveType(config.type || 'any'),
    default: config.default,
    nocache: config.nocache,
    set: config.set || defaultSetter,
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

function defaultSetter(name, value) {
  this._nativeSet(name, value);
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
