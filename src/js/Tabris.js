/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

/*global tabris: true */

(function() {

  tabris = util.extend(function(id) {
    if (!tabris._proxies[id] && !tabris[id]) {
      throw new Error("No native object with id or type " + id);
    }
    var nativeId = tabris[id] && tabris[id]._type ? tabris[id]._type : id;
    return nativeId in tabris._proxies ? tabris._proxies[nativeId] : new tabris[id](nativeId);
  }, {

    _loadFunctions: [],
    _proxies: {},

    load: function(fn) {
      tabris._loadFunctions.push(fn);
    },

    create: function(type, properties) {
      if (!tabris._nativeBridge) {
        throw new Error("tabris.js not started");
      }
      if (!(type in tabris)) {
        throw new Error("Unknown type " + type);
      }
      return new tabris[type]()._create(properties);
    },

    registerType: function(type, members) {
      if (type in tabris) {
        throw new Error("Type already registered: " + type);
      }
      tabris[type] = function() {
        tabris.Proxy.apply(this, arguments);
      };
      for (var key in constructorDefaults) {
        tabris[type][key] = members[key] || constructorDefaults[key]();
      }
      var superProto = util.omit(members, Object.keys(constructorDefaults));
      superProto.type = type;
      superProto.constructor = tabris[type]; // util.extendPrototype can not provide the original
      tabris[type].prototype = util.extendPrototype(tabris.Proxy, superProto);
    },

    _start: function(client) {
      tabris._nativeBridge = new tabris.NativeBridge(client);
      var i = 0;
      while (i < tabris._loadFunctions.length) {
        tabris._loadFunctions[i++].call();
      }
      tabris.trigger("flush");
    },

    _notify: function(id, event, param) {
      var proxy = tabris._proxies[id];
      if (proxy) {
        proxy._trigger(event, param);
      }
      tabris.trigger("flush");
    },

    _reset: function() {
      this._loadFunctions = [];
      this._proxies = {};
    }

  });

  var constructorDefaults = {
    _trigger: function() { return {}; },
    _listen: function() { return {}; },
    _properties: function() { return {}; },
    _type: function() { return null; }
  };

})();
