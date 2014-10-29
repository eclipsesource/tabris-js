/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  tabris.Proxy = function(id) {
    this.id = id || generateId();
    tabris._proxies[this.id] = this;
  };

  util.extend(tabris.Proxy.prototype, tabris.Events, {

    _create: function(properties) {
      var type = this.constructor._type || this.type;
      tabris._nativeBridge.create(this.id, type);
      this._setProperties(util.extend({}, this.constructor._properties, properties));
      return this;
    },

    append: function() {
      this._checkDisposed();
      for (var i = 0; i < arguments.length; i++) {
        if (!(arguments[i] instanceof tabris.Proxy)) {
          throw new Error("Cannot append non-widget");
        }
        arguments[i]._setParent(this);
      }
      return this;
    },

    appendTo: function(proxy) {
      this._checkDisposed();
      if (!(proxy instanceof tabris.Proxy)) {
        throw new Error("Cannot append to non-widget");
      }
      this._setParent(proxy);
      return this;
    },

    get: function(name) {
      this._checkDisposed();
      return this._decodeProperty(name, tabris._nativeBridge.get(this.id, name));
    },

    set: function(arg1, arg2) {
      this._checkDisposed();
      if (typeof arg1 === "string") {
        this._setProperty(arg1, arg2);
      } else {
        this._setProperties(arg1);
      }
      return this;
    },

    animate: function(properties, options) {
      tabris.Animation.animate(this, properties, options);
    },

    call: function(method, parameters) {
      this._checkDisposed();
      return tabris._nativeBridge.call(this.id, method, parameters);
    },

    on: function(event, listener, context) {
      this._checkDisposed();
      var wasListening = this._isListening(event);
      tabris.Events.on.call(this, event, listener, context);
      if (!wasListening) {
        this._listen(event, true);
      }
      return this;
    },

    off: function(event, listener, context) {
      this._checkDisposed();
      tabris.Events.off.call(this, event, listener, context);
      if (!this._isListening(event)) {
        this._listen(event, false);
      }
      return this;
    },

    dispose: function() {
      if (!this._isDisposed) {
        tabris._nativeBridge.destroy(this.id);
        this._destroy();
        if (this._parent) {
          this._parent._removeChild(this);
        }
        this._isDisposed = true;
      }
    },

    parent: function() {
      return this._parent;
    },

    children: function() {
      return this._children ? Array.prototype.slice.call(this._children) : [];
    },

    _listen: function(event, state) {
      var listen = this.constructor && this.constructor._listen && this.constructor._listen[event];
      if (!listen) {
        console.info("Unknown event type " + event);
      } else if (typeof listen === "string") {
        tabris._nativeBridge.listen(this.id, listen, state);
      } else if (listen instanceof Function) {
        listen.call(this, state);
      } else {
        tabris._nativeBridge.listen(this.id, event, state);
      }
    },

    _trigger: function(event, params) {
      var trigger = this.constructor && this.constructor._trigger && this.constructor._trigger[event];
      if (!trigger) {
        this.trigger(event, params);
      } else if (trigger instanceof Function) {
        trigger.call(this, params);
      } else {
        this.trigger(trigger, params);
      }
    },

    _destroy: function() {
      this._destroyChildren();
      this.trigger("dispose", {});
      tabris.Events.off.call(this);
      delete tabris._proxies[this.id];
    },

    _destroyChildren: function() {
      if (this._children) {
        for (var i = 0; i < this._children.length; i++) {
          this._children[i]._destroy();
        }
      }
    },

    _addChild: function(child) {
      if (!this._children) {
        this._children = [];
      }
      this._children.push(child);
    },

    _removeChild: function(child) {
      if (this._children) {
        var index = this._children.indexOf(child);
        if (index !== -1) {
          this._children.splice(index, 1);
        }
      }
    },

    _checkDisposed: function() {
      if (this._isDisposed) {
        throw new Error("Object is disposed");
      }
    },

    _setProperties: function(properties) {
      for (var name in properties) {
        this._setProperty(name, properties[name]);
      }
    },

    _setProperty: function(name, value) {
      try {
        tabris._nativeBridge.set(this.id, name, this._encodeProperty(name, value));
      } catch (error) {
        console.warn("Unsupported " + name + " value: " + error.message);
      }
    },

    _encodeProperty: function(name, value) {
      switch (name) {
        case "foreground":
        case "background":
          return encodeColor(value);
        case "font":
          return encodeFont(value);
        case "image":
        case "backgroundImage":
          return encodeImage(value);
        case "images":
          return encodeImages(value);
        case "layoutData":
          return encodeLayoutData(checkLayoutData(value));
        case "bounds":
          return encodeBounds(value);
      }
      return encodeProxyToId(value);
    },

    _getContainer: function() {
      return this;
    },

    _setParent: function(parent) {
      tabris._nativeBridge.set(this.id, "parent", encodeProxyToId(parent._getContainer()));
      if (this._parent) {
        this._parent._removeChild(this);
      }
      this._parent = parent;
      this._parent._addChild(this);
    },

    _decodeProperty: function(name, value) {
      switch (name) {
        case "foreground":
        case "background":
          return decodeColor(value);
        case "font":
          return decodeFont(value);
        case "image":
        case "backgroundImage":
          return decodeImage(value);
        case "bounds":
          return decodeBounds(value);
        case "images":
          return decodeImages(value);
      }
      return value;
    }

  });

  function encodeColor(value) {
    return util.colorStringToArray(value);
  }

  function encodeFont(value) {
    return util.fontStringToArray(value);
  }

  function decodeFont(value) {
    return util.fontArrayToString(value);
  }

  function encodeImage(value) {
    return util.imageToArray(value);
  }

  function decodeImage(value) {
    return util.imageFromArray(value);
  }

  function decodeBounds(value) {
    return {left: value[0], top: value[1], width: value[2], height: value[3]};
  }

  function encodeImages(value) {
    return value.map(function(value) {
      return value == null ? null : util.imageToArray(value);
    });
  }

  function decodeImages(value) {
    return value.map(function(value) {
      return value == null ? null : util.imageFromArray(value);
    });
  }

  function checkLayoutData(layoutData) {
    if ("centerX" in layoutData) {
      if (("left" in layoutData) || ("right" in layoutData)) {
        console.warn("Inconsistent layoutData: centerX overrides left and right");
        return util.omit(layoutData, ["left", "right"]);
      }
    } else if (!("left" in layoutData) && !("right" in layoutData)) {
      console.warn("Incomplete layoutData: either left, right or centerX should be specified");
    }
    if ("baseline" in layoutData) {
      if (("top" in layoutData) || ("bottom" in layoutData) || ("centerY" in layoutData)) {
        console.warn("Inconsistent layoutData: baseline overrides top, bottom, and centerY");
        return util.omit(layoutData, ["top", "bottom", "centerY"]);
      }
    } else if ("centerY" in layoutData) {
      if (("top" in layoutData) || ("bottom" in layoutData)) {
        console.warn("Inconsistent layoutData: centerY overrides top and bottom");
        return util.omit(layoutData, ["top", "bottom"]);
      }
    } else if (!("top" in layoutData) && !("bottom" in layoutData)) {
      console.warn("Incomplete layoutData: either top, bottom, centerY, or baseline should be specified");
    }
    return layoutData;
  }

  function encodeLayoutData(layoutData) {
    var result = {};
    for (var key in layoutData) {
      if (Array.isArray(layoutData[key])) {
        result[key] = layoutData[key].map(encodeProxyToId);
      } else {
        result[key] = encodeProxyToId(layoutData[key]);
      }
    }
    return result;
  }

  function encodeBounds(bounds) {
    return [bounds.left, bounds.top, bounds.width, bounds.height];
  }

  function encodeProxyToId(value) {
    return value instanceof tabris.Proxy ? value.id : value;
  }

  function decodeColor(value) {
    return util.colorArrayToString(value);
  }

  var idSequence = 1;

  function generateId() {
    return "o" + (idSequence++);
  }

  var textTypeToStyle = {
    password: ["BORDER", "SINGLE", "PASSWORD"],
    search: ["BORDER", "SINGLE", "SEARCH"],
    multiline: ["BORDER", "MULTI"],
    default: ["BORDER", "SINGLE"]
  };

  util.extend(tabris.Proxy, {
    _widgetListen: function(listenMap) {
      return util.extend({
        touchstart: true,
        touchmove: true,
        touchend: true,
        longpress: true,
        dispose: function() {},
        "change:bounds": "Resize"
      }, (listenMap || {}));
    },
    _widgetTrigger: function(triggerMap) {
      return util.extend({
        Resize: "change:bounds"
      }, (triggerMap || {}));
    }
  });

  tabris.registerType("Button", {
    _type: "rwt.widgets.Button",
    _properties: {style: ["PUSH"]},
    _listen: tabris.Proxy._widgetListen({selection: "Selection"}),
    _trigger: tabris.Proxy._widgetTrigger({Selection: "selection"})
  });
  tabris.registerType("Canvas", {
    _type: "rwt.widgets.Canvas",
    _listen: tabris.Proxy._widgetListen(),
    _trigger: tabris.Proxy._widgetTrigger()
  });
  tabris.registerType("CheckBox", {
    _type: "rwt.widgets.Button",
    _properties: {style: ["CHECK"]},
    _listen: tabris.Proxy._widgetListen({Selection: "change:selection"}),
    _trigger: tabris.Proxy._widgetTrigger({"change:selection": "Selection"})
  });
  tabris.registerType("Combo", {
    _type: "rwt.widgets.Combo",
    _listen: tabris.Proxy._widgetListen({Selection: "change:selection"}),
    _trigger: tabris.Proxy._widgetTrigger({"change:selection": "Selection"})
  });
  tabris.registerType("Composite", {
    _type: "rwt.widgets.Composite",
    _listen: tabris.Proxy._widgetListen(),
    _trigger: tabris.Proxy._widgetTrigger()
  });
  tabris.registerType("ImageView", {
    _type: "tabris.ImageView",
    _listen: tabris.Proxy._widgetListen(),
    _trigger: tabris.Proxy._widgetTrigger()
  });
  tabris.registerType("Label", {
    _type: "rwt.widgets.Label",
    _listen: tabris.Proxy._widgetListen(),
    _trigger: tabris.Proxy._widgetTrigger()
  });
  tabris.registerType("ProgressBar", {
    _type: "rwt.widgets.ProgressBar",
    _listen: tabris.Proxy._widgetListen(),
    _trigger: tabris.Proxy._widgetTrigger()
  });
  tabris.registerType("RadioButton", {
    _type: "rwt.widgets.Button",
    _properties: {style: ["RADIO"]},
    _listen: tabris.Proxy._widgetListen({Selection: "change:selection"}),
    _trigger: tabris.Proxy._widgetTrigger({"change:selection": "Selection"})
  });
  tabris.registerType("_ScrollBar", {
    _type: "rwt.widgets.ScrollBar",
    _listen: tabris.Proxy._widgetListen({Selection: true}),
    _trigger: tabris.Proxy._widgetTrigger({Selection: true})
  });
  tabris.registerType("Slider", {
    _type: "rwt.widgets.Scale",
    _listen: tabris.Proxy._widgetListen({Selection: "change:selection"}),
    _trigger: tabris.Proxy._widgetTrigger({"change:selection": "Selection"})
  });
  tabris.registerType("Text", {
    _type: "rwt.widgets.Text",
    _create: function(properties) {
      var style = textTypeToStyle[properties.type] || textTypeToStyle["default"];
      return this.super("_create", util.extend({style: style}, properties));
    },
    _listen: tabris.Proxy._widgetListen({focusin: "FocusIn", focusout: "FocusOut"}),
    _trigger: tabris.Proxy._widgetTrigger({FocusIn: "focusin", FocusOut: "focusout"})
  });
  tabris.registerType("ToggleButton", {
    _type: "rwt.widgets.Button",
    _properties: {style: ["TOGGLE"]},
    _listen: tabris.Proxy._widgetListen({Selection: "change:selection"}),
    _trigger: tabris.Proxy._widgetTrigger({"change:selection": "Selection"})
  });
  tabris.registerType("WebView", {
    _type: "rwt.widgets.Browser",
    _listen: tabris.Proxy._widgetListen(),
    _trigger: tabris.Proxy._widgetTrigger()
  });

})();
