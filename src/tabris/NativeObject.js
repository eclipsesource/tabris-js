import {types} from './property-types';
import {hint} from './Console';
import EventObject from './EventObject';
import Events from './Events';
import Listeners from './Listeners';
import {toXML} from './Console';

const EventsClass = /** @type {any} */ function EventsClass() {};
Object.assign(EventsClass.prototype, Events);

/**
 * Add indexer to NativeObject since defineProperties sabotages intellisense
 * @typedef NativeObjectBase
 * @type {{new(): typeof Events & {[key: string]: any}}}
 */
/**
 * @abstract
 */
export default class NativeObject extends (/** @type {NativeObjectBase} */(EventsClass)) {

  /**
   * @param {object} target
   * @param {import('./internals').PropertyDefinitions} definitions
   */
  static defineProperties(target, definitions) {
    for (const name in definitions) {
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
   * @param {import('./internals').EventDefinitions} definitions
   */
  static defineEvents(target, definitions) {
    for (const name in definitions) {
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
      get _nativeType() { return nativeType; }
    };
  }

  /**
   * @param {object|boolean=} param
   */
  constructor(param) {
    super();
    this._nativeCreate(param);
  }

  set(properties = {}) {
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
      hint(this, 'Cannot get property "' + name + '" on disposed object');
      return;
    }
    const getter = this.$getPropertyGetter(name) || this._getStoredProperty;
    const value = getter.call(this, name);
    return this._decodeProperty(this._getTypeDef(name), value);
  }

  $setProperty(name, value) {
    if (this._isDisposed) {
      hint(this, 'Cannot set property "' + name + '" on disposed object');
      return;
    }
    const typeDef = this._getTypeDef(name);
    let encodedValue;
    try {
      encodedValue = this._encodeProperty(typeDef, value);
    } catch (ex) {
      hint(this, 'Ignored unsupported value for property "' + name + '": ' + ex.message);
      return;
    }
    const setter = this.$getPropertySetter(name) || this._storeProperty;
    setter.call(this, name, encodedValue);
  }

  _storeProperty(name, encodedValue) {
    const oldEncodedValue = this._getStoredProperty(name);
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
    const prop = this['$prop_' + name];
    return prop ? prop.type : null;
  }

  _getDefaultPropertyValue(name) {
    const prop = this['$prop_' + name];
    return prop ? valueOf(prop.default) : undefined;
  }

  _encodeProperty(typeDef, value) {
    return (typeDef && typeDef.encode) ? typeDef.encode.call(this, value) : value;
  }

  _decodeProperty(typeDef, value) {
    return (typeDef && typeDef.decode) ? typeDef.decode.call(this, value) : value;
  }

  $getPropertyGetter(name) {
    const prop = this['$prop_' + name];
    return prop ? prop.get : undefined;
  }

  $getPropertySetter(name) {
    const prop = this['$prop_' + name];
    return prop ? prop.set : undefined;
  }

  _triggerChangeEvent(propertyName, newEncodedValue) {
    const typeDef = this._getTypeDef(propertyName);
    const decodedValue = this._decodeProperty(typeDef, newEncodedValue);
    this.$trigger(propertyName + 'Changed', {value: decodedValue});
  }

  /**
   * @abstract
   * @type {string}
   * */
  get _nativeType() {
    throw new Error('Can not create instance of abstract class ' + this.constructor.name);
  }

  _nativeCreate(param) {
    this._register();
    tabris._nativeBridge.create(this.cid, this._nativeType);
    if (param instanceof Object) {
      this.set(param);
    }
  }

  _register() {
    if (typeof tabris === 'undefined' || !tabris._nativeBridge) {
      throw new Error('tabris.js not started');
    }
    const cid = tabris._nativeObjectRegistry.register(this);
    Object.defineProperty(this, 'cid', {value: cid});
  }

  /**
   * @param {string[]} properties
   */
  _reorderProperties(properties) {
    return properties;
  }

  dispose() {
    this._disposedToStringValue = this.toString();
    this.toString = () => this._disposedToStringValue + ' (disposed)';
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
      tabris._nativeObjectRegistry.remove(this.cid);
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
    const event = new EventObject();
    for (const key in eventData) {
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
    tabris._nativeBridge.set(this.cid, name, value === undefined ? null : value);
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

  [toXML]() {
    if (this._isDisposed) {
      return `<${this._getXMLElementName()} cid='${this.cid}' disposed='true'/>`;
    }
    const content = this._getXMLContent();
    if (!content.length) {
      return this._getXMLHeader(false);
    }
    return `${this._getXMLHeader(true)}\n${content.join('\n')}\n${this._getXMLFooter(true)}`;
  }

  _getXMLHeader(hasChild) {
    const attributes = this._getXMLAttributes()
      .map(entry => `${entry[0]}='${('' + entry[1]).replace(/'/g, '\\\'').replace(/\n/g, '\\n')}'`)
      .join(' ');
    return `<${this._getXMLElementName()} ${attributes}${!hasChild ? '/' : ''}>`;
  }

  _getXMLFooter(hasChild) {
    return hasChild ? `</${this._getXMLElementName()}>` : '';
  }

  _getXMLElementName() {
    return this.constructor.name;
  }

  _getXMLAttributes() {
    return [['cid', this.cid]];
  }

  _getXMLContent() {
    return [];
  }

}

NativeObject.defineEvents(NativeObject.prototype, {
  dispose: true
});

function setExistingProperty(name, value) {
  if (!(name in this)) {
    hint(this, 'There is no setter for property "' + name + '"');
  }
  this[name] = value;
}

function normalizeProperty(property) {
  const config = typeof property === 'string' ? {type: property} : property;
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
    const args = type.slice(1);
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
  hint(this, `Can not set read-only property "${name}"`);
}

/** @this {NativeObject} */
function defaultSetter(name, value) {
  this._nativeSet(name, value);
  if (this['$prop_' + name].nocache) {
    this._triggerChangeEvent(name, value);
  } else {
    this._storeProperty(name, value);
  }
}

/** @this {NativeObject} */
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
