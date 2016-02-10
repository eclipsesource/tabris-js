(function(module) {

  window.tabris = module.exports = _.extend(function(id) {
    if (!tabris._proxies[id] && !tabris[id]) {
      throw new Error("No native object with cid or type " + id);
    }
    var cid = tabris[id] && tabris[id]._type ? tabris[id]._type : id;
    return cid in tabris._proxies ? tabris._proxies[cid] : new tabris[id](cid);
  }, {

    _loadFunctions: [],
    _proxies: {},
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

    registerType: function(type, members) {
      if (type in tabris) {
        throw new Error("Type already registered: " + type);
      }
      tabris[type] = function(arg) {
        if (typeof arg === "string") {
          // internal use with cid
          tabris.Proxy.call(this, arg);
        } else {
          if (!tabris._nativeBridge) {
            throw new Error("tabris.js not started");
          }
          tabris.Proxy.call(this);
          if (typeof arg === "object") {
            this._create(arg);
          }
        }
      };
      for (var member in staticMembers) {
        tabris[type][member] = members[member] || getDefault(member);
      }
      tabris[type]._events = normalizeEventsMap(tabris[type]._events);
      tabris[type]._properties = normalizePropertiesMap(tabris[type]._properties);
      tabris[type]._trigger = buildTriggerMap(tabris[type]._events);
      var superProto = _.omit(members, Object.keys(staticMembers));
      superProto.type = type;
      superProto.constructor = tabris[type]; // _.extendPrototype can not provide the original
      tabris[type].prototype = _.extendPrototype(tabris.Proxy, superProto);
    },

    version: "${VERSION}",

    _init: function(client) {
      tabris.off();
      tabris._off();
      tabris._client = client;
      tabris._nativeBridge = new tabris.NativeBridge(client);
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
        var proxy = tabris._proxies[cid];
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
      this._proxies = {};
    }

  });

  var normalizeEventsMap = tabris.registerType.normalizeEventsMap = function(events) {
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
  };

  var normalizePropertiesMap = tabris.registerType.normalizePropertiesMap = function(properties) {
    var result = {};
    for (var property in properties) {
      var entry = properties[property];
      if (entry === true) {
        // TODO: Remove this block once current tabris.js is considered incompatible with developer
        //       apps older than tabris 1.2 (which have cordova.js files built in using this syntax)
        console.warn("A custom component uses deprecated property type value 'true'");
        entry = "any";
      }
      var shortHand = (typeof entry === "string" || Array.isArray(entry));
      result[property] = {
        type: resolveType((shortHand ? entry : entry.type) || "any"),
        default: entry.default,
        nocache: entry.nocache,
        access: {
          set: entry.access && entry.access.set || defaultSetter,
          get: entry.access && entry.access.get || defaultGetter
        }
      };
    }
    return result;
  };

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
      typeDef = _.clone(typeDef);
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
    return value instanceof Object ? _.clone(value) : value;
  }

  var staticMembers = {
    "_events": {},
    "_initProperties": {},
    "_type": null,
    "_properties": {},
    "_supportsChildren": false
  };

}(typeof module !== "undefined" ? module : {}));
