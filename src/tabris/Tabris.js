import NativeObject from './NativeObject';
import NativeBridge from './NativeBridge';
import NativeObjectRegistry from './NativeObjectRegistry';
import {error} from './Console';
import {proxify} from './util';

export default class Tabris extends NativeObject {

  constructor() {
    super();
    Object.defineProperties(this, {
      _started: {enumerable: false, writable: true, value: false},
      _init: {enumerable: false, writable: true, value: this._init.bind(this)},
      _notify: {enumerable: false, writable: true, value: this._notify.bind(this)},
      _stackTraceStack: {enumerable: false, writable: true, value: []},
      _nativeObjectRegistry: {enumerable: false, writable: true, value: null},
      _client: {enumerable: false, writable: true, value: null},
      _nativeBridge: {enumerable: false, writable: true, value: null},
      _entryPoint: {enumerable: false, writable: true, value: null}
    });
    this.$publishProxies();
  }

  get version() {
    return '${VERSION}';
  }

  get started() {
    return !!this._started;
  }

  flush() {
    this.trigger('tick');
    this.trigger('flush');
    this._nativeBridge.clearCache();
    this._nativeBridge.flush();
  }

  get _nativeType() {
    return 'tabris.Tabris';
  }

  /** @override */
  _nativeCreate() {}

  _register() {
    this._nativeObjectRegistry = new NativeObjectRegistry();
    const cid = this._nativeObjectRegistry.register(this);
    Object.defineProperty(this, 'cid', {value: cid});
  }

  _init(client, options) {
    this._client = client;
    this._nativeBridge = new NativeBridge(client);
    this._register();
    this._nativeBridge.create(this.cid, this._nativeType);
    this.trigger('start', options || {headless: false});
    this._started = true;
  }

  _setEntryPoint(entryPoint) {
    this._entryPoint = entryPoint;
  }

  _notify(cid, event, param) {
    let returnValue;
    try {
      const nativeObject = this._nativeObjectRegistry.find(cid);
      if (nativeObject) {
        try {
          const eventDef = nativeObject['$event_' + event];
          if (eventDef && eventDef.changes) {
            this._nativeBridge.cacheValue(cid, eventDef.changes, eventDef.changeValue(param));
          }
          returnValue = nativeObject._trigger(event, param);
        } catch (err) {
          error(err);
        }
      }
      this.flush();
    } catch (err) {
      error(err);
    }
    return returnValue;
  }

  $publishProxies() {
    [
      'contentView', 'drawer', 'navigationBar', 'statusBar', 'permission', 'printer', 'device', 'app', 'localStorage',
      'secureStorage', 'crypto', 'fs', 'pkcs5', 'sizeMeasurement', 'devTools', 'process', 'authentication'
    ].forEach(name => {
      const value = proxify(() => this['$' + name]);
      Object.defineProperty(this, name, {value});
    });
  }

}

NativeObject.defineEvents(Tabris.prototype, {
  start: {},
  flush: {},
  layout: {},
  log: {}
});
