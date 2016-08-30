import {extend, extendPrototype, omit, clone} from "./util";
import Events from "./Events";
import NativeBridge from "./NativeBridge";
import Proxy from "./Proxy";
import ProxyStore from "./ProxyStore";

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

  create: function(type, properties) {
    if (!(type in tabris)) {
      throw new Error("Unknown type " + type);
    }
    return new tabris[type](properties || {});
  },

  registerType: function(type, members, superType) {
    if (type in tabris) {
      throw new Error("Type already registered: " + type);
    }
    tabris[type] = function(properties) {
      if (!(this instanceof tabris[type])) {
        throw new Error("Cannot call constructor as a function");
      }
      if (tabris[type]._cid) {
        Proxy.call(this, tabris[type]._cid);
      } else {
        if (!tabris._nativeBridge) {
          throw new Error("tabris.js not started");
        }
        Proxy.call(this);
        this._create(properties || {});
      }
    };
    for (var member in staticMembers) {
      tabris[type][member] = members[member] || getDefault(member);
    }
    tabris[type]._events = normalizeEvents(tabris[type]._events);
    tabris[type]._properties = normalizeProperties(tabris[type]._properties);
    tabris[type]._trigger = buildTriggerMap(tabris[type]._events);
    var superProto = omit(members, Object.keys(staticMembers));
    superProto.type = type;
    superProto.constructor = tabris[type]; // extendPrototype can not provide the original
    tabris[type].prototype = extendPrototype(superType || Proxy, superProto);
    mapProperties(tabris[type].prototype, tabris[type]._properties);
  },

  version: "${VERSION}",

  _init: function(client) {
    tabris.off();
    tabris._off();
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

function normalizeEvents(events) {
  var result = {};
  for (var event in events) {
    var entry = events[event];
    result[event] = typeof entry === "object" ? entry : {};
    if (!result[event].name) {
      result[event].name = typeof entry === "string" ? entry : event;
    }
    if (result[event].alias) {
      result[event].originalName = event;
      result[result[event].alias] = result[event];
    }
  }
  return result;
}

function normalizeProperties(properties) {
  var result = {};
  for (var name in properties) {
    result[name] = normalizeProperty(properties[name]);
  }
  return result;
}

function normalizeProperty(property) {
  if (property === true) {
    // TODO: Remove this block once current tabris.js is considered incompatible with developer
    //       apps older than tabris 1.2 (which have cordova.js files built in using this syntax)
    console.warn("A custom component uses deprecated property type value 'true'");
    property = "any";
  }
  var shortHand = (typeof property === "string" || Array.isArray(property));
  var setter = property.access && property.access.set || defaultSetter;
  var getter = property.access && property.access.get || defaultGetter;
  return {
    type: resolveType((shortHand ? property : property.type) || "any"),
    default: property.default,
    nocache: property.nocache,
    set: setter,
    get: getter
  };
}

function resolveType(type) {
  var typeDef = type;
  if (typeof type === "string") {
    typeDef = tabris.PropertyTypes[type];
  } else if (Array.isArray(type)) {
    typeDef = tabris.PropertyTypes[type[0]];
  }
  if (typeof typeDef !== "object") {
    throw new Error("Can not find property type " + type);
  }
  if (Array.isArray(type)) {
    typeDef = clone(typeDef);
    var args = type.slice(1);
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
    return fn.apply(window, [value].concat(args));
  };
}

function defaultSetter(name, value, options) {
  this._nativeSet(name, value);
  if (this.constructor._properties[name].nocache) {
    this._triggerChangeEvent(name, value, options);
  } else {
    this._storeProperty(name, value, options);
  }
}

function defaultGetter(name) {
  var result = this._getStoredProperty(name);
  if (result === undefined) {
    // TODO: cache read property, but not for device properties
    result = this._nativeGet(name);
  }
  return result;
}

function buildTriggerMap(events) {
  var result = {};
  for (var event in events) {
    var name = events[event].name;
    result[name] = event;
  }
  return result;
}

function getDefault(member) {
  var value = staticMembers[member];
  return value instanceof Object ? clone(value) : value;
}

function mapProperties(target, definitions) {
  for (var property in definitions) {
    createProperty(target, property);
  }
}

function createProperty(target, property) {
  Object.defineProperty(target, property, {
    set: function(value) {
      this.set(property, value);
    },
    get: function() {
      return this.get(property);
    }
  });
}

var staticMembers = {
  "_events": {},
  "_initProperties": {},
  "_type": null,
  "_cid": null,
  "_properties": {},
  "_supportsChildren": false
};
