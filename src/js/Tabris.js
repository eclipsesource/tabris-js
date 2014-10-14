/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

/*global tabris: true */

(function() {

  tabris = util.extend(function(id) {
    return id in tabris._proxies ? tabris._proxies[id] : new tabris.Proxy(id);
  }, {

    _loadFunctions: [],
    _proxies: {},
    _localEventNames: getLocalEventNames(),
    _nativeEventNames: util.invert(getLocalEventNames()),

    load: function(fn) {
      tabris._loadFunctions.push(fn);
    },

    create: function(type, properties) {
      if (!tabris._nativeBridge) {
        throw new Error("tabris.js not started");
      }
      if (!(type in tabris)) {
        // TODO [rst] Allow unregistered types for compatibility, replace with error
        tabris.registerType(type, {});
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
      members.type = type;
      tabris[type].prototype = util.extendPrototype(tabris.Proxy, members);
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
      var proxy = tabris._proxies[id];
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
        return {touches: [{x: param.x, y: param.y}], time: param.time};
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
      MenuDetect: "longpress",
      Selection: "selection",
      Resize: "resize",
      Scroll: "scroll",
      Modify: "modify"
    };
  }

  var touchEvents = ["MouseDown", "MouseUp", "MouseMove", "MenuDetect"];

})();
