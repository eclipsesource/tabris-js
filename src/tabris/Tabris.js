import Events from './Events';
import NativeBridge from './NativeBridge';
import ProxyStore from './ProxyStore';

export default class Tabris {

  constructor() {
    this._started = false;
    this._init = this._init.bind(this);
    this._notify = this._notify.bind(this);
  }

  get version() {
    return '${VERSION}';
  }

  get started() {
    return !!this._started;
  }

  _init(client) {
    this._client = client;
    this._proxies = new ProxyStore();
    this._nativeBridge = new NativeBridge(client);
    this.trigger('start');
    this._started = true;
  }

  _setEntryPoint(entryPoint) {
    this._entryPoint = entryPoint;
  }

  _notify(cid, event, param) {
    let returnValue;
    try {
      let proxy = this._proxies.find(cid);
      if (proxy) {
        try {
          returnValue = proxy._trigger(event, param);
        } catch (error) {
          console.error(error);
          console.log(error.stack);
        }
      }
      this.trigger('flush');
      this.trigger('flushed');
    } catch (ex) {
      console.error(ex);
      console.log(ex.stack);
    }
    return returnValue;
  }

}

Object.assign(Tabris.prototype, Events);
