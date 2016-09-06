import {extend} from "./util";
import Events from "./Events";
import NativeBridge from "./NativeBridge";
import ProxyStore from "./ProxyStore";
import Proxy from "./Proxy";

window.tabris = extend({}, Events, {

  _loadFunctions: [],
  _proxies: new ProxyStore(),
  _ready: false,

  load: function(fn) {
    if (tabris._ready) {
      fn.call();
    } else {
      tabris._loadFunctions.push(fn);
    }
  },

  registerType: function(type, members, superType) {
    if (type in tabris) {
      throw new Error("Type already registered: " + type);
    }
    members._name = type;
    tabris[type] = Proxy.extend(members, superType);
  },

  version: "${VERSION}",

  _init: function(client) {
    tabris._client = client;
    tabris._nativeBridge = new NativeBridge(client);
    var i = 0;
    while (i < tabris._loadFunctions.length) {
      tabris._loadFunctions[i++].call();
    }
    tabris._ready = true;
  },

  _setEntryPoint: function(entryPoint) {
    this._entryPoint = entryPoint;
  },

  _notify: function(cid, event, param) {
    var returnValue;
    try {
      var proxy = tabris._proxies.find(cid);
      if (proxy) {
        try {
          returnValue = proxy._trigger(event, param);
        } catch (error) {
          console.error(error);
          console.log(error.stack);
        }
      }
      tabris.trigger("flush");
    } catch (ex) {
      console.error(ex);
      console.log(ex.stack);
    }
    return returnValue;
  },

  _reset: function() {
    this._loadFunctions = [];
    this._proxies = new ProxyStore();
  }

});
