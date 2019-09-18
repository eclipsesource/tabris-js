import {types} from './property-types';
import {hint, toXML} from './Console';
import EventObject from './EventObject';
import Events from './Events';
import Listeners, {ChangeListeners} from './Listeners';
import {allowOnlyValues, allowOnlyKeys} from './util';

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
   * @template {NativeObject} T
   * @param {T} target
   * @param {PropertyDefinitions<T>} definitions
   */
  static defineProperties(target, definitions) {
    for (const name in definitions) {
      NativeObject.defineProperty(target, name, definitions[name]);
    }
  }

  /**
   * @param {object} target
   * @param {string} name
   * @param {Partial<PropertyDefinition>} property
   */
  static defineProperty(target, name, property) {
    const def = normalizeProperty(property);
    target['$prop_' + name] = def;
    Object.defineProperty(target, name, {
      set(value) {
        this.$setProperty(name, value);
      },
      get() {
        return this.$getProperty(name);
      }
    });
    if (!def.const) {
      this.defineChangeEvent(target, name);
    }
  }

  /**
   * @param {NativeObject} target
   * @param {EventDefinitions} definitions
   */
  static defineEvents(target, definitions) {
    for (const name in definitions) {
      NativeObject.defineEvent(target, name, definitions[name]);
    }
  }

  /**
   * @param {NativeObject} target
   * @param {string} name
   * @param {EventDefinition|true} definition
   */
  static defineEvent(target, name, definition) {
    const property = 'on' + name.charAt(0).toUpperCase() + name.slice(1);
    const $property = '$' + property;
    const $eventProperty = '$event_' + name;
    if (target[$eventProperty]) {
      throw new Error('Event already defined');
    }
    const def = target[$eventProperty] = normalizeEvent(name, definition);
    if (def.changes) {
      this.synthesizeChangeEvents(target, name, def);
    }
    Object.defineProperty(target, property, {
      get() {
        if (!this[$property]) {
          this[$property] = new Listeners(this, name);
        }
        return this[$property];
      }
    });
  }

  /**
   * @param {NativeObject} target
   * @param {string[]} properties
   */
  static defineChangeEvents(target, properties) {
    properties.forEach(property => this.defineChangeEvent(target, property));
  }

  static defineChangeEvent(target, property) {
    const listenersProperty = 'on' + property.charAt(0).toUpperCase() + property.slice(1) + 'Changed';
    const $listenersProperty = '$' + property + 'Changed';
    Object.defineProperty(target, listenersProperty, {
      get() {
        if (!this[$listenersProperty]) {
          this[$listenersProperty] = new ChangeListeners(this, property);
        }
        return this[$listenersProperty];
      }
    });
  }

  static synthesizeChangeEvents(target, sourceEvent, sourceDef) {
    const changeListener = function (ev) {
      this.$trigger(sourceDef.changes + 'Changed', {value: sourceDef.changeValue(ev)});
    };
    const $changeEventProperty = '$event_' + sourceDef.changes + 'Changed';
    /** @type {EventDefinition} */
    const changeEventDef = target[$changeEventProperty] = target[$changeEventProperty] || {listen: []};
    changeEventDef.listen.push((target, listening) => {
      target._onoff(sourceEvent, listening, changeListener);
    });
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
    Object.defineProperty(this, '$props', {
      writable: true, value: /** @type {{[property: string]: unknown}} */ ({})
    });
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

  /**
   * @param {string} name
   */
  $getProperty(name) {
    if (this._isDisposed) {
      hint(this, 'Cannot get property "' + name + '" on disposed object');
      return;
    }
    const def = this._getPropertyDefinition(name);
    if (def.nocache) {
      const value = this._nativeGet(name);
      return def.type.decode ? def.type.decode.call(null, value, this) : value;
    }
    const storedValue = this._getStoredProperty(name);
    if (storedValue !== undefined) {
      return storedValue;
    }
    if (def.default !== undefined) {
      return def.default;
    }
    const value = this._nativeGet(name);
    const decodedValue = def.type.decode ? def.type.decode.call(this, value) : value;
    this._storeProperty(name, decodedValue);
    return decodedValue;
  }

  /**
   * @param {string} name
   * @param {unknown} value
   */
  $setProperty(name, value) {
    if (this._isDisposed) {
      hint(this, 'Cannot set property "' + name + '" on disposed object');
      return;
    }
    const def = this._getPropertyDefinition(name);
    if (def.readonly) {
      hint(this, `Can not set read-only property "${name}"`);
      return;
    } else if (def.const && this._wasSet(name)) {
      hint(this, `Can not set const property "${name}"`);
      return;
    }
    let convertedValue = value;
    try {
      convertedValue = this._convertValue(def, value, convertedValue);
    } catch (ex) {
      this._printPropertyWarning(name, ex);
      return;
    }
    const encodedValue = def.type.encode.call(null, convertedValue, this);
    if (def.nocache) {
      this._beforePropertyChange(name, convertedValue);
      this._nativeSet(name, encodedValue);
      if (!def.const) {
        this._triggerChangeEvent(name, convertedValue);
      }
    } else if (this._getStoredProperty(name) !== convertedValue || !this._wasSet(name)) {
      this._beforePropertyChange(name, convertedValue);
      this._nativeSet(name, encodedValue);
      this._storeProperty(name, convertedValue, def.const);
    }
  }

  /**
   * @param {PropertyDefinition} def
   * @param {any} value
   * @param {any} convertedValue
   */
  _convertValue(def, value, convertedValue) {
    if (!def.nullable || value !== null) {
      // TODO: ensure convert has no write-access to the NativeObject instance via proxy
      convertedValue = allowOnlyValues(def.type.convert.call(null, value, this), def.choice);
    }
    return convertedValue;
  }

  /**
   * @param {string} name
   * @param {Error} ex
   */
  _printPropertyWarning(name, ex) {
    hint(this, 'Ignored unsupported value for property "' + name + '": ' + ex.message);
  }

  /**
   * @param {string} name
   * @param {unknown} newValue
   * @param {boolean=} noChangeEvent
   * @returns {boolean}
   */
  _storeProperty(name, newValue, noChangeEvent = false) {
    if (newValue === this._getStoredProperty(name) && this._wasSet(name)) {
      return false;
    }
    if (newValue === undefined) {
      return false;
    } else {
      this.$props[name] = newValue;
    }
    if (!noChangeEvent) {
      this._triggerChangeEvent(name, newValue);
    }
    return true;
  }

  /**
   * @param {string} name
   */
  _getStoredProperty(name) {
    let result = this.$props ? this.$props[name] : undefined;
    if (result === undefined) {
      result = this._getPropertyDefinition(name).default;
    }
    return result;
  }

  _wasSet(name) {
    return name in (this.$props || {});
  }

  /**
   * @param {string} propertyName
   * @returns {PropertyDefinition}
   */
  _getPropertyDefinition(propertyName) {
    return this['$prop_' + propertyName] || {};
  }

  _decodeProperty(typeDef, value) {
    return (typeDef && typeDef.decode) ? typeDef.decode.call(null, value, this) : value;
  }

  $getPropertyGetter(name) {
    const prop = this['$prop_' + name];
    return prop ? prop.get : undefined;
  }

  _triggerChangeEvent(propertyName, value) {
    this.$trigger(propertyName + 'Changed', {value});
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
    this._dispose();
  }

  _dispose(skipNative) {
    if (!this._isDisposed && !this._inDispose) {
      this._inDispose = true;
      this._disposedToStringValue = this.toString();
      this.toString = () => this._disposedToStringValue + ' (disposed)';
      this._trigger('dispose');
      this._release();
      if (!skipNative) {
        tabris._nativeBridge.destroy(this.cid);
      }
      tabris._nativeObjectRegistry.remove(this.cid);
      this.$props = null;
      this._isDisposed = true;
    }
  }

  _release() {
  }

  /**
   * Called when a property is about to be changed, past conversion and all
   * other pre-checks. May have side-effects. Exceptions will not be catched.
   * @param {string} name
   * @param {any} value
   */
  // @ts-ignore
  // eslint-disable-next-line no-unused-vars
  _beforePropertyChange(name, value) {}

  isDisposed() {
    return !!this._isDisposed;
  }

  _listen(name, listening) {
    const eventDef = this['$event_' + name];
    if (eventDef) {
      eventDef.listen.forEach(listen => listen(this, listening));
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

/**
 * @param {Partial<PropertyDefinition>}  config
 * @returns {PropertyDefinition}
 */
function normalizeProperty(config) {
  const def = {
    type: normalizeType(config.type || {}),
    default: config.default,
    nullable: !!config.nullable,
    const: !!config.const,
    nocache: !!config.nocache,
    readonly: !!config.readonly,
    choice: config.choice
  };
  if (def.readonly && (def.default !== undefined)) {
    throw new Error('Can not combine "nocache" with "readonly"');
  }
  if (def.readonly && def.nullable) {
    throw new Error('Can not combine "nullable" with "readonly"');
  }
  if (def.readonly && def.choice) {
    throw new Error('Can not combine "choice" with "readonly"');
  }
  if (def.choice && def.choice.length < 2) {
    throw new Error('"choice" needs at least two entries');
  }
  if ((def.default === undefined) && !def.nocache && !def.readonly) {
    throw new Error('"default" must be given unless "nocache" or "readonly" is true.');
  }
  allowOnlyKeys(config, Object.keys(def));
  return def;
}

/**
 * @param {string} name
 * @param {EventDefinition|true} definition
 * @returns {EventDefinition}
 */
function normalizeEvent(name, definition) {
  const result = {listen: []};
  if (definition === true) {
    return result;
  }
  Object.assign(result, definition);
  if (definition.native) {
    result.listen.push((target, listening) => {
      target._nativeListen(name, listening);
    });
  }
  if(result.changes) {
    const changeValue = result.changeValue;
    if (typeof changeValue === 'string') {
      result.changeValue =  ev => ev[changeValue];
    } else if (!changeValue) {
      result.changeValue =  ev => ev[result.changes];
    }
  }
  return result;
}

/**
 * @param {string|TypeDef<any, any, any>} config
 * @returns {TypeDef<any, any, any>}
 */
function normalizeType(config) {
  const def = typeof config === 'string' ? types[config] : config;
  allowOnlyKeys(def, ['convert', 'encode', 'decode']);
  return {
    convert: def.convert || (v => v),
    encode: def.encode || (v => v),
    decode: def.decode || (v => v)
  };
}
