/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  var noop = function() {};

  tabris.DOMEvent = function(type, eventInitDict) {
    this.type = type;
    this.timeStamp = Date.now();
    if (typeof eventInitDict !== "undefined") {
      if ("bubbles" in eventInitDict) {
        this.bubbles = eventInitDict.bubbles;
      }
      if ("cancelable" in eventInitDict) {
        this.cancelable = eventInitDict.cancelable;
      }
    }
  };

  tabris.DOMEvent.prototype = {
    NONE: 0,
    CAPTURING_PHASE: 1,
    AT_TARGET: 2,
    BUBBLING_PHASE: 3,
    target: null,
    currentTarget: null,
    eventPhase: 0,
    bubbles: false,
    cancelable: false,
    defaultPrevented: false,
    isTrusted: false,
    stopPropagation: noop,
    stopImmediatePropagation: noop,
    preventDefault: noop
  };

  tabris._addDOMEventTargetMethods = function(target) {

    if (typeof target.addEventListener === "function") {
      return;
    }

    var listeners;

    target.addEventListener = function(type, listener /*, useCapture*/) {
      if (!listeners) {
        listeners = [];
      }
      if (!(type in listeners)) {
        listeners[type] = [];
      }
      var index = listeners[type].indexOf(listener);
      if (index === -1) {
        listeners[type].push(listener);
      }
      return listeners[type].length === 1;
    };

    target.removeEventListener = function(type, listener /*, useCapture*/) {
      if (listeners && type in listeners) {
        var index = listeners[type].indexOf(listener);
        if (index !== -1) {
          listeners[type].splice(index, 1);
          return listeners[type].length === 0;
        }
      }
      return false;
    };

    target.dispatchEvent = function(event) {
      if (listeners && event.type in listeners) {
        var eventListeners = listeners[event.type];
        for (var i = 0; i < eventListeners.length; i++) {
          eventListeners[i].call(this, event);
        }
      }
    };

  };

  if (typeof window !== "undefined") {
    tabris._addDOMEventTargetMethods(window);
    if (!window.Event) {
      window.Event = tabris.DOMEvent;
    }
  }

}());
