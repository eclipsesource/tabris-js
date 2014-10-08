/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

/*global tabris: true */

(function() {

  tabris = util.extend(function(id) {
    return id in tabris._proxies ? tabris._proxies[ id ] : new tabris.Proxy(id);
  }, {

    _loadFunctions: [],
    _proxies: {},
    _factories: {},
    _localEventNames: getLocalEventNames(),
    _nativeEventNames: util.invert(getLocalEventNames()),

    load: function(fn) {
      tabris._loadFunctions.push(fn);
    },

    create: function(type, properties) {
      if (!tabris._nativeBridge) {
        throw new Error("tabris.js not started");
      }
      return tabris.Proxy.create(type, properties);
    },

    registerType: function(type, factory) {
      if (type in tabris._factories) {
        throw new Error("Factory already registered for type " + type);
      }
      tabris._factories[type] = factory;
    },

    _start: function(nativeBridge) {
      tabris._nativeBridge = nativeBridge;
      var i = 0;
      while (i < tabris._loadFunctions.length) {
        tabris._loadFunctions[i++].call();
      }
      tabris.trigger("flush");
    },

    _notify: function(id, event, param) {
      var proxy = tabris._proxies[ id ];
      if (proxy) {
        proxy._trigger(tabris._decodeEventName(event), tabris._decodeEventParam(event, param));
      }
      tabris.trigger("flush");
    },

    _reset: function() {
      this._loadFunctions = [];
      this._proxies = {};
    },

    _decodeEventName: function(event) {
      return this._localEventNames[event] || event;
    },

    _encodeEventName: function(event) {
      return this._nativeEventNames[event] || event;
    },

    _decodeEventParam: function(event, param) {
      if (touchEvents.indexOf(event) !== -1) {
        return {touches: [{x: param.x, y: param.y}]};
      }
      return param;
    }

  });

  function getLocalEventNames() {
    return {
      FocusIn: "focusin",
      FocusOut: "focusout",
      MouseDown: "touchstart",
      MouseMove: "touchmove",
      MouseUp: "touchend",
      MenuDetect: "longpress"
    };
  }

  var touchEvents = ["MouseDown", "MouseUp", "MouseMove", "MenuDetect"];

})();
