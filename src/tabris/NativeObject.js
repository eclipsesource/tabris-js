import {types} from './property-types';
import Events from './Events';

function EventsClass() {}
Object.assign(EventsClass.prototype, Events);

export default class NativeObject extends EventsClass {

  static extend(members, superType = NativeObject) {
    let cid = members._cid;
    let type = members._type;
    let Type = class extends superType {
      constructor(properties) {
        if (cid) {
          super(cid);
        } else {
          super();
          this._create(type, properties || {});
        }
      }
    };
    for (let key in members) {
      if (!['_cid', '_name', '_type', '_events', '_properties'].includes(key)) {
        throw new Error('Illegal config option: ' + key);
      }
    }
    let events = normalizeEvents(members._events || {});
    let trigger = buildTriggerMap(events);
    let properties = normalizeProperties(members._properties || {});
    Object.assign(Type.prototype, {
      $events: events,
      $trigger: trigger,
      $properties: properties
    });
    createProperties(Type.prototype, properties);
    return Type;
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
    let prop = this.$properties[name];
    return prop ? prop.type : null;
  }

  _getDefaultPropertyValue(name) {
    let prop = this.$properties[name];
    return prop ? valueOf(prop.default) : undefined;
  }

  _encodeProperty(typeDef, value) {
    return (typeDef && typeDef.encode) ? typeDef.encode(value) : value;
  }

  _decodeProperty(typeDef, value) {
    return (typeDef && typeDef.decode) ? typeDef.decode(value) : value;
  }

  _getPropertyGetter(name) {
    let prop = this.$properties[name];
    return prop ? prop.get : undefined;
  }

  _getPropertySetter(name) {
    let prop = this.$properties[name];
    return prop ? prop.set : undefined;
  }

  _triggerChangeEvent(propertyName, newEncodedValue) {
    let typeDef = this._getTypeDef(propertyName);
    let decodedValue = this._decodeProperty(typeDef, newEncodedValue);
    this.trigger('change:' + propertyName, this, decodedValue);
  }

  _create(type, properties) {
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
      this.trigger('dispose', this, {});
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
    let config = this.$events[name];
    if (config) {
      this._nativeListen(config.name, listening);
    }
  }

  _nativeListen(event, state) {
    this._checkDisposed();
    tabris._nativeBridge.listen(this.cid, event, state);
  }

  _trigger(event, param = {}) {
    let name = this.$trigger[event];
    let trigger = name && this.$events[name].trigger;
    if (trigger instanceof Function) {
      return trigger.call(this, name, param);
    } else {
      this.trigger(name, param);
    }
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

function normalizeEvents(events) {
  let result = {};
  for (let name in events) {
    let config = events[name];
    result[name] = typeof config === 'object' ? config : {};
    if (!result[name].name) {
      result[name].name = typeof config === 'string' ? config : name;
    }
  }
  return result;
}

function normalizeProperties(properties) {
  let result = {};
  for (let name in properties) {
    result[name] = normalizeProperty(properties[name]);
  }
  return result;
}

function normalizeProperty(property) {
  let shortHand = (typeof property === 'string' || Array.isArray(property));
  let setter = property.access && property.access.set || defaultSetter;
  let getter = property.access && property.access.get || defaultGetter;
  return {
    type: resolveType((shortHand ? property : property.type) || 'any'),
    default: property.default,
    nocache: property.nocache,
    set: setter,
    get: getter
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

function defaultSetter(name, value, options) {
  this._nativeSet(name, value);
  if (this.$properties[name].nocache) {
    this._triggerChangeEvent(name, value, options);
  } else {
    this._storeProperty(name, value, options);
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

function buildTriggerMap(events) {
  let result = {};
  for (let event in events) {
    let name = events[event].name;
    result[name] = event;
  }
  return result;
}

function createProperties(target, definitions) {
  for (let property in definitions) {
    createProperty(target, property);
  }
}

function createProperty(target, property) {
  Object.defineProperty(target, property, {
    set(value) {
      this._setProperty(property, value);
    },
    get() {
      return this._getProperty(property);
    }
  });
}

function valueOf(value) {
  return value instanceof Function ? value() : value;
}
