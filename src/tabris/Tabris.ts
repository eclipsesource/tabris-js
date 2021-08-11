import NativeObject from './NativeObject';
import NativeBridge from './NativeBridge';
import NativeObjectRegistry from './NativeObjectRegistry';
import {error} from './Console';
import {proxify} from './util';
import type ContentView from './widgets/ContentView';
import Listeners from './Listeners';
import {validateMessage} from './Worker';
import Event from './Event';
import type App from './App';

export default class Tabris extends NativeObject {

  contentView!: ContentView;
  headless!: boolean;
  onMessage!: Listeners<{target: Tabris}>;
  onMessageError!: Listeners<{target: Tabris}>;
  _logPushInterval: number = -1;
  $app!: App;

  _client: any;
  _stackTraceStack!: any[];
  _nativeObjectRegistry!: NativeObjectRegistry | null;
  _entryPoint!: string | null;
  _started!: boolean;
  _nativeBridge!: NativeBridge | null;
  _logBuffer: LogEventData[] | null = null;
  _pushBufferTimer: any = null;

  constructor() {
    super();
    Object.defineProperties(this, {
      _started: {enumerable: false, writable: true, value: false},
      _init: {enumerable: false, writable: true, value: this._init.bind(this)},
      postMessage: {enumerable: false,  value: this.postMessage.bind(this)},
      close: {enumerable: false,  value: this.close.bind(this)},
      $sendLogBufferInternal: {enumerable: false, value: this.$sendLogBufferInternal.bind(this)},
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

  get logPushInterval() {
    return this._logPushInterval;
  }

  set logPushInterval(value: number) {
    this._logPushInterval = value;
    if (this.headless && this.logPushInterval > -1) {
      this.on('_log', this.$logToBuffer, this);
      this.$logToBuffer({});
    } else {
      this._logBuffer = null;
      this.off('_log', this.$logToBuffer, this);
    }
  }

  flush() {
    this.trigger('tick');
    this.trigger('flush');
    this._nativeBridge!.clearCache();
    this._nativeBridge!.flush();
  }

  postMessage(data?: any, transferList?: any[]) {
    if (this.headless) {
      validateMessage(data);
      const logs = this.logPushInterval >= 0 ? this._logBuffer : null;
      const internal = false;
      this._nativeCall('postMessage', {data, transferList, logs, internal});
      if (logs) {
        this._logBuffer = null;
      }
    }
  }

  close() {
    if (this.headless) {
      this.$sendLogBufferInternal();
      this._nativeCall('close', {});
    }
  }

  get _nativeType() {
    return 'tabris.Tabris';
  }

  /** @override */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _nativeCreate() {}

  _register() {
    this._nativeObjectRegistry = new NativeObjectRegistry();
    const cid = this._nativeObjectRegistry.register(this);
    Object.defineProperty(this, 'cid', {value: cid});
  }

  _init(client: any, options?: {headless?: boolean}) {
    this._client = client;
    Object.defineProperty(this, 'headless', {writable: false, value: !!options?.headless});
    this._nativeBridge = new NativeBridge(client);
    this._register();
    this._nativeBridge.create(this.cid, this._nativeType);
    if (this.headless) {
      this.on('_log', this.$logToBuffer, this);
      this._listen('message', true);
    }
    this.trigger('start', options || {headless: false});
    if (this.$app?.debugBuild) {
      this.logPushInterval = 2000;
    }
    this._started = true;
    global.postMessage = this.postMessage;
    global.close = this.close;
  }

  _setEntryPoint(entryPoint: string) {
    this._entryPoint = entryPoint;
  }

  _notify(cid: string, event: string, param?: object) {
    let returnValue;
    try {
      const nativeObject = this._nativeObjectRegistry!.find(cid);
      if (nativeObject) {
        try {
          const eventDef = nativeObject['$event_' + event];
          if (eventDef && eventDef.changes) {
            this._nativeBridge!.cacheValue(cid, eventDef.changes, eventDef.changeValue(param));
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

  _trigger(event: string, param: any) {
    if (event === 'message') {
      return this.$handleMessage(param);
    } else if (event === 'messageError') {
      return this.$handleMessageError(param);
    }
    return super._trigger(event, param);
  }

  $publishProxies() {
    [
      'contentView', 'drawer', 'navigationBar', 'statusBar', 'permission', 'printer', 'device', 'app', 'localStorage',
      'secureStorage', 'crypto', 'fs', 'input', 'pkcs5', 'sizeMeasurement', 'devTools', 'process', 'authentication'
    ].forEach(name => {
      const value = proxify(() => (this as any)['$' + name]);
      Object.defineProperty(this, name, {value});
    });
  }

  $logToBuffer({level, message}: any) {
    if (!this._logBuffer) {
      this._logBuffer = [];
    }
    if (level) {
      this._logBuffer!.push({level, message, logTime: Date.now()});
    }
    if (this.logPushInterval > -1 && this._pushBufferTimer === null) {
      this._pushBufferTimer = setTimeout(this.$sendLogBufferInternal, this.logPushInterval);
    }
  }

  $handleMessage({internal, data}: {internal: boolean, data: any}) {
    if (internal) {
      if (data === 'terminate') {
        this.$sendLogBufferInternal();
      }
    } else {
      this.trigger('message', {data});
      const event = Object.assign(new Event('message'), {data});
      global.dispatchEvent(event);
    }
    return false;
  }

  $sendLogBufferInternal() {
    const logs = this._logBuffer;
    this._pushBufferTimer = null;
    this._logBuffer = null;
    if (this.logPushInterval === -1) {
      this.off('_log', this.$logToBuffer, this);
      return;
    }
    if (!logs) {
      return;
    }
    this._nativeCall('postMessage', {logs, internal: true});
  }

  $handleMessageError(rawEvent: any) {
    this.trigger('messageError', rawEvent);
    const event = Object.assign(new Event('messageerror'), {data: rawEvent.data});
    global.dispatchEvent(event);
    return false;
  }

}

NativeObject.defineEvents(Tabris.prototype, {
  start: {},
  flush: {},
  layout: {},
  log: {},
  message: {native: true},
  messageError: {native: true}
});
