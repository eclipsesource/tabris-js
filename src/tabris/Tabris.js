import Events from './Events';
import NativeBridge from './NativeBridge';
import ProxyStore from './ProxyStore';

export default class Tabris {

  constructor() {
    this._loadFunctions = [];
    this._ready = false;
    this._init = this._init.bind(this);
    this._notify = this._notify.bind(this);
  }

  load(fn) {
    if (this._ready) {
      fn.call();
    } else {
      this._loadFunctions.push(fn);
    }
  }

  get version() {
    return '${VERSION}';
  }

  _init(client) {
    this._client = client;
    this._proxies = new ProxyStore();
    this._nativeBridge = new NativeBridge(client);
    let i = 0;
    while (i < this._loadFunctions.length) {
      this._loadFunctions[i++].call();
    }
    this._ready = true;
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
    } catch (ex) {
      console.error(ex);
      console.log(ex.stack);
    }
    return returnValue;
  }

}

Object.assign(Tabris.prototype, Events);
