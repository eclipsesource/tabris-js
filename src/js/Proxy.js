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
      var type = this._type || this.type;
      var properties = util.extend(this._properties || {}, this._encodeProperties(properties));
      tabris._nativeBridge.create(this.id, type, properties);
      return this;
    },

    append: function() {
      this._checkDisposed();
      for (var i = 0; i < arguments.length; i++) {
        if (!(arguments[i] instanceof tabris.Proxy)) {
          throw new Error("Cannot append non-widget");
        }
        this._append(arguments[i]);
      }
      return this;
    },

    appendTo: function(proxy) {
      this._checkDisposed();
      if (!(proxy instanceof tabris.Proxy)) {
        throw new Error("Cannot append to non-widget");
      }
      proxy._append(this);
      return this;
    },

    _append: function(proxy) {
      proxy.set("parent", this);
    },

    get: function(name) {
      this._checkDisposed();
      return this._decodeProperty(name, tabris._nativeBridge.get(this.id, name));
    },

    set: function(arg1, arg2) {
      this._checkDisposed();
      var properties;
      if (typeof arg1 === "string") {
        properties = {};
        properties[arg1] = arg2;
      } else {
        properties = arg1;
      }
      tabris._nativeBridge.set(this.id, this._encodeProperties(properties));
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
        tabris._nativeBridge.listen(this.id, tabris._encodeEventName(event), true);
      }
      return this;
    },

    off: function(event, listener, context) {
      this._checkDisposed();
      tabris.Events.off.call(this, event, listener, context);
      if (!this._isListening(event)) {
        tabris._nativeBridge.listen(this.id, tabris._encodeEventName(event), false);
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

    _trigger: function() {
      this.trigger.apply(this, arguments);
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

    _encodeProperties: function(properties) {
      var result = {};
      for (var key in properties) {
        this._setProperty(key, properties[key], result);
      }
      return result;
    },

    _setProperty: function(name, value, target) {
      try {
        target[name] = this._encodeProperty(name, value);
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
        case "parent":
          this._setParent(value);
          return encodeProxyToId(value._getContainer());
      }
      return encodeProxyToId(value);
    },

    _getContainer: function() {
      return this;
    },

    _setParent: function(parent) {
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

  tabris.registerType("Button", {
    _type: "rwt.widgets.Button",
    _properties: {style: ["PUSH"]}
  });
  tabris.registerType("Canvas", {
    _type: "rwt.widgets.Canvas"
  });
  tabris.registerType("CheckBox", {
    _type: "rwt.widgets.Button",
    _properties: {style: ["CHECK"]}
  });
  tabris.registerType("Combo", {
    _type: "rwt.widgets.Combo"
  });
  tabris.registerType("Composite", {
    _type: "rwt.widgets.Composite"
  });
  tabris.registerType("ProgressBar", {
    _type: "rwt.widgets.ProgressBar"
  });
  tabris.registerType("RadioButton", {
    _type: "rwt.widgets.Button",
    _properties: {style: ["RADIO"]}
  });
  tabris.registerType("ToggleButton", {
    _type: "rwt.widgets.Button",
    _properties: {style: ["TOGGLE"]}
  });
  tabris.registerType("Label", {
    _type: "rwt.widgets.Label"
  });
  tabris.registerType("Text", {
    _type: "rwt.widgets.Text",
    _create: function(properties) {
      var style = textTypeToStyle[properties.type] || textTypeToStyle["default"];
      return this.super("_create", util.extend({style: style}, properties));
    }
  });
  tabris.registerType("WebView", {
    _type: "rwt.widgets.Browser"
  });

})();
