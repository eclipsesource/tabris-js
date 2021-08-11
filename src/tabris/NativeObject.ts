import ChangeListeners from './ChangeListeners';
import {hint} from './Console';
import EventObject from './EventObject';
import {EventsClass} from './Events';
import Listeners from './Listeners';
import {PropertyTypes, types} from './property-types';
import * as symbols from './symbols';
import {notify} from './symbols';
import {allowOnlyKeys, allowOnlyValues, equals} from './util';

export default abstract class NativeObject extends EventsClass {

  static defineProperties<T extends NativeObject>(target: T, definitions: PropertyDefinitions<T>) {
    for (const name in definitions) {
      NativeObject.defineProperty(target, name as keyof T & string, definitions[name]);
    }
  }

  static defineProperty<T extends NativeObject>(
    target: T,
    name: keyof T & string,
    property: TabrisProp<any, unknown, any>
  ) {
    const def = normalizeProperty(property);
    Object.defineProperty(target, '$prop_' + name, {
      enumerable: false,
      writable: false,
      value: def
    });
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

  static defineEvents<T extends NativeObject>(target: T, definitions: EventDefinitions) {
    for (const name in definitions) {
      NativeObject.defineEvent(target, name as any, definitions[name]);
    }
  }

  static defineEvent<T extends NativeObject>(
    target: T,
    name: string,
    definition: EventDefinition | true
  ) {
    const property = 'on' + name.charAt(0).toUpperCase() + name.slice(1);
    const $property = '$' + property;
    const $eventProperty = '$event_' + name as keyof T;
    if (target[$eventProperty]) {
      throw new Error('Event already defined');
    }
    const def = (target as any)[$eventProperty] = normalizeEvent.call(this.prototype, name, definition);
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

  static defineChangeEvents<T extends NativeObject>(target: T, properties: Array<keyof T & string>) {
    properties.forEach(property => this.defineChangeEvent(target, property));
  }

  static defineChangeEvent<T>(target: T, property: keyof T & string) {
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

  static synthesizeChangeEvents<T extends NativeObject>(
    target: T,
    sourceEvent: string,
    sourceDef: EventDefinition
  ) {
    const name = sourceDef.changes + 'Changed';
    const changeListener = function(this: NativeObject, ev: EventObject) {
      const changeValue = sourceDef.changeValue as ((arg: EventObject) => any);
      this.$trigger(name, {value: changeValue(ev)});
    };
    const $changeEventProperty = '$event_' + name as keyof T;
    const changeEventDef: EventDefinition
      = (target as any)[$changeEventProperty]
      = target[$changeEventProperty] || {listen: []};
    changeEventDef.listen?.push((instance, listening) => {
      instance._onoff(sourceEvent, listening, changeListener);
    });
    if (sourceDef.nativeObservable !== false) {
      target[symbols.nativeObservables] = (target[symbols.nativeObservables] || []).concat();
      target[symbols.nativeObservables]!.push(name);
    }
  }

  static extend(nativeType: string, superType = NativeObject) {
    return class extends superType {
      get _nativeType() { return nativeType; }
    };
  }

  readonly cid: string = '';
  _isDisposed?: boolean;
  _inDispose?: boolean;
  _disposedToStringValue?: string;
  [symbols.nativeObservables]?: string[];
  private $props?: Partial<this> | null;

  constructor(param?: object | boolean) {
    super();
    // TODO: Use decorators to make non-enumerable properties
    Object.defineProperty(this, '$props', {
      enumerable: false,
      writable: true,
      value: {}
    });
    this._nativeCreate(param);
  }

  set(properties: Props<this>) {
    if (arguments.length === 0) {
      throw new Error('Not enough arguments');
    }
    if (arguments.length > 1) {
      throw new Error('Too many arguments');
    }
    this._reorderProperties(Object.keys(properties || {}))
      .forEach(name => setExistingProperty.call(this, name, properties[name as keyof typeof properties]));
    return this;
  }

  dispose() {
    this._dispose();
  }

  isDisposed() {
    return !!this._isDisposed;
  }

  toString() {
    return this.constructor.name;
  }

  [symbols.toXML]() {
    if (this._isDisposed) {
      return `<${this._getXMLElementName()} cid='${this.cid}' disposed='true'/>`;
    }
    const content = this._getXMLContent();
    if (!content.length) {
      return this._getXMLHeader(false);
    }
    return `${this._getXMLHeader(true)}\n${content.join('\n')}\n${this._getXMLFooter(true)}`;
  }

  _dispose(skipNative?: boolean) {
    if (!this._isDisposed && !this._inDispose) {
      Object.defineProperties(this, {
        _inDispose: {enumerable: false, writable: false, value: true},
        _disposedToStringValue: {enumerable: false, writable: false, value: this.toString()}
      });
      this.toString = () => this._disposedToStringValue + ' (disposed)';
      this._trigger('dispose');
      this._release();
      if (!skipNative) {
        tabris._nativeBridge!.destroy(this.cid);
      }
      tabris._nativeObjectRegistry!.remove(this.cid);
      this.$props = null;
      Object.defineProperty(
        this, '_isDisposed', {enumerable: false, writable: false, value: true}
      );
    }
  }

  $getProperty(name: PropName<this>) {
    if (this._isDisposed) {
      hint(this, 'Cannot get property "' + name + '" on disposed object');
      return;
    }
    const def = this._getPropertyDefinition(name);
    if (def.nocache) {
      const nativeValue = this._nativeGet(name);
      return def.type?.decode ? def.type.decode.call(null, nativeValue, this) : nativeValue;
    }
    const storedValue = this._getStoredProperty(name);
    if (storedValue !== undefined) {
      return storedValue;
    }
    if (def.default !== undefined) {
      return def.default;
    }
    const value = this._nativeGet(name);
    const decodedValue = def.type?.decode ? def.type.decode.call(this, value, this) : value;
    this._storeProperty(name, decodedValue);
    return decodedValue;
  }

  $setProperty<Name extends PropName<this>>(name: Name, value: unknown) {
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
    let convertedValue: this[Name];
    try {
      convertedValue = this._convertValue(def, value, value);
    } catch (ex) {
      this._printPropertyWarning(name, ex);
      return;
    }
    const encodedValue = def.type?.encode?.call(null, convertedValue, this);
    if (def.nocache) {
      this._beforePropertyChange(name, convertedValue);
      this._nativeSet(name, encodedValue);
      if (!def.const) {
        this._triggerChangeEvent(name, convertedValue);
      }
    } else if (!equals(this._getStoredProperty(name), convertedValue) || !this._wasSet(name)) {
      this._beforePropertyChange(name, convertedValue);
      this._nativeSet(name, encodedValue);// TODO should not happen if changing from unset to default
      this._storeProperty(name, convertedValue, def.const);
    }
  }

  _convertValue(def: Partial<PropertyDefinition>, value: unknown, convertedValue: any) {
    if (!def.nullable || value !== null) {
      // TODO: ensure convert has no write-access to the NativeObject instance via proxy
      convertedValue = allowOnlyValues(def.type?.convert?.call(null, value, this), def.choice);
    }
    return convertedValue;
  }

  _printPropertyWarning(name: string, ex: Error) {
    hint(this, 'Ignored unsupported value for property "' + name + '": ' + ex.message);
  }

  _storeProperty<Name extends PropName<this>>(
    name: Name,
    newValue: this[Name],
    noChangeEvent: boolean = false
  ) {
    if ((newValue as any) === this._getStoredProperty(name) && this._wasSet(name)) {
      return false;
    }
    if (newValue === undefined) {
      return false;
    } else {
      this.$props![name] = newValue;
    }
    if (!noChangeEvent) {
      this._triggerChangeEvent(name, newValue);
    }
    return true;
  }

  _getStoredProperty(name: PropName<this>) {
    let result = (this.$props ? this.$props[name] : undefined);
    if (result === undefined) {
      result = this._getPropertyDefinition(name).default;
    }
    return result;
  }

  _wasSet(name: PropName<this>) {
    return name in (this.$props || {});
  }

  _getPropertyDefinition(propertyName: PropName<this>): Partial<PropertyDefinition> {
    const defKey = '$prop_' + propertyName as keyof this;
    return this[defKey] || {};
  }

  _decodeProperty(typeDef: TypeDef<any, any, this>, value: any) {
    return (typeDef && typeDef.decode) ? typeDef.decode.call(null, value, this) : value;
  }

  _triggerChangeEvent(propertyName: PropName<this>, value: any) {
    this.$trigger(propertyName + 'Changed', {value});
  }

  get _nativeType(): string {
    throw new Error('Can not create instance of abstract class ' + this.constructor.name);
  }

  _nativeCreate(param: any) {
    this._register();
    tabris._nativeBridge!.create(this.cid, this._nativeType);
    if (param instanceof Object) {
      this.set(param);
    }
  }

  _register() {
    if (typeof tabris === 'undefined' || !tabris._nativeBridge) {
      throw new Error('tabris.js not started');
    }
    const cid = tabris._nativeObjectRegistry!.register(this);
    Object.defineProperty(this, 'cid', {value: cid});
  }

  _reorderProperties(properties: string[]): string[] {
    return properties;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _release() {}

  /**
   * Called when a property is about to be changed, past conversion and all
   * other pre-checks. May have side-effects. Exceptions will not be catched.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  _beforePropertyChange(name: string, value: any) {}

  _listen(name: string, listening: boolean) {
    const defKey = '$event_' + name as keyof this;
    const eventDef = this[defKey] as EventDefinition;
    if (eventDef) {
      eventDef.listen?.forEach(listen => listen(this, listening));
    }
  }

  _nativeListen(event: string, state: boolean) {
    this._checkDisposed();
    tabris._nativeBridge!.listen(this.cid, event, state);
  }

  _trigger(name: string, eventData = {}) {
    return this.$trigger(name, eventData);
  }

  $trigger(name: string, eventData: {[data: string]: unknown} = {}) {
    const dispatchObject = this[notify](name, eventData, false);
    return !!(dispatchObject as any)?.defaultPrevented;
  }

  _onoff(name: string, listening: boolean, listener: Function) {
    if (listening) {
      this.on(name, listener);
    } else {
      this.off(name, listener);
    }
  }

  _checkDisposed() {
    if (this._isDisposed) {
      throw new Error('Object is disposed');
    }
  }

  _nativeSet(name: string, value: unknown) {
    this._checkDisposed();
    tabris._nativeBridge!.set(this.cid, name, value === undefined ? null : value);
  }

  _nativeGet(name: string) {
    this._checkDisposed();
    return tabris._nativeBridge!.get(this.cid, name);
  }

  _nativeCall(method: string, parameters?: NativeProps) {
    this._checkDisposed();
    return tabris._nativeBridge!.call(this.cid, method, parameters as any);
  }

  _getXMLHeader(hasChild: boolean) {
    const attributes = this._getXMLAttributes()
      .map(entry => `${entry[0]}='${('' + entry[1]).replace(/'/g, '\\\'').replace(/\n/g, '\\n')}'`)
      .join(' ');
    return `<${this._getXMLElementName()} ${attributes}${!hasChild ? '/' : ''}>`;
  }

  _getXMLFooter(hasChild: boolean) {
    return hasChild ? `</${this._getXMLElementName()}>` : '';
  }

  _getXMLElementName() {
    return this.constructor.name;
  }

  _getXMLAttributes() {
    return [['cid', this.cid]];
  }

  _getXMLContent(): string[] {
    return [];
  }

}

export default interface NativeObject {
  onDispose: Listeners & Listeners['addListener'];
}

NativeObject.defineEvents(NativeObject.prototype, {
  dispose: true
});

function setExistingProperty<Target extends NativeObject>(this: Target, name: string, value: any) {
  if (!(name in this)) {
    hint(this, 'There is no setter for property "' + name + '"');
  }
  this[name as keyof Target] = value;
}

function normalizeProperty(config: TabrisProp<any, any, any>): PropertyDefinition {
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

function normalizeEvent(this: NativeObject, name: string, definition: EventDefinition|true): EventDefinition {
  const result: EventDefinition = {listen: []};
  if (definition === true) {
    return result;
  }
  Object.assign(result, definition);
  if (definition.native) {
    result.listen?.push((target, listening) => {
      target._nativeListen(name, listening);
    });
  }
  const changes = result.changes;
  if(changes) {
    const changeValue = result.changeValue;
    if (typeof changeValue === 'string') {
      result.changeValue =  (ev: EventObject & {[key: string]: any}) => ev[changeValue];
    } else if (!changeValue) {
      result.changeValue =  (ev: EventObject & {[key: string]: any}) => ev[changes];
    }
  }
  return result;
}

function normalizeType(
  config: keyof PropertyTypes | TypeDef<any, any, any> | Constructor<NativeObject>
): TypeDef<any, any, any> {
  if (config instanceof Function) {
    if (!(config.prototype instanceof NativeObject)) {
      throw new Error('not a constructor of NativeObject');
    }
    return {
      convert(value) {
        if (!(value instanceof config)) {
          throw new Error('Not an instance of ' + config.name);
        }
        return value;
      },
      encode(value) {
        return value ? value.cid : null;
      },
      decode(value) {
        return value ? tabris._nativeObjectRegistry!.find(value) : null;
      }
    };
  }
  const def = typeof config === 'string' ? types[config] : config;
  allowOnlyKeys(def, ['convert', 'encode', 'decode']);
  return {
    convert: def.convert || (v => v),
    encode: def.encode || (v => v),
    decode: def.decode || (v => v)
  };
}
