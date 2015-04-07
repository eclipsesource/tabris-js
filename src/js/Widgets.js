(function() {

  tabris.Widgets = {

    append: function() {
      this._checkDisposed();
      var proxies = arguments[0] instanceof tabris.ProxyCollection ? arguments[0].toArray() : arguments;
      for (var i = 0; i < proxies.length; i++) {
        if (!(proxies[i] instanceof tabris.Proxy)) {
          throw new Error("Cannot append non-widget");
        }
        proxies[i]._setParent(this);
      }
      return this;
    },

    appendTo: function(proxy) {
      this._checkDisposed();
      proxy = proxy instanceof tabris.ProxyCollection ? proxy.first() : proxy;
      if (!(proxy instanceof tabris.Proxy)) {
        throw new Error("Cannot append to non-widget");
      }
      this._setParent(proxy);
      return this;
    },

    parent: function() {
      return this._parent;
    },

    children: function(selector) {
      return new tabris.ProxyCollection(this._children, selector);
    },

    find: function(selector) {
      return new tabris.ProxyCollection(this._children, selector, true);
    },

    apply: function(sheet) {
      var scope = new tabris.ProxyCollection(this._children.concat(this), "*", true);
      if (sheet["*"]) {
        scope.set(sheet["*"]);
      }
      var selector;
      for (selector in sheet) {
        if (selector !== "*" && selector[0] !== "#") {
          scope.filter(selector).set(sheet[selector]);
        }
      }
      for (selector in sheet) {
        if (selector[0] === "#") {
          scope.filter(selector).set(sheet[selector]);
        }
      }
      return this;
    },

    _getContainer: function() {
      return this;
    },

    _setParent: function(parent) {
      this._nativeSet("parent", tabris.PropertyEncoding.proxy(parent._getContainer(this)));
      if (this._parent) {
        this._parent._removeChild(this);
      }
      this._parent = parent;
      this._parent._addChild(this);
    },

    _addChild: function(child) {
      var check = this.constructor._supportsChildren;
      if (check === false) {
        throw new Error(this.type + " cannot contain children");
      }
      if (typeof check === "function" && !check(child)) {
        throw new Error(this.type + " cannot contain children of type " + child.type);
      }
      if (!this._children) {
        this._children = [];
      }
      this._children.push(child);
      this.trigger("addchild", this, child, {});
    },

    _removeChild: function(child) {
      if (this._children) {
        var index = this._children.indexOf(child);
        if (index !== -1) {
          this._children.splice(index, 1);
        }
        this.trigger("removechild", this, child, {index: index});
      }
    },

    _destroyChildren: function() {
      if (this._children) {
        for (var i = 0; i < this._children.length; i++) {
          this._children[i]._destroy();
        }
      }
    },

    _getEventConfig: function(type) {
      var result = tabris.Proxy.prototype._getEventConfig.call(this, type);
      if (!result && this.get("gestures")[type]) {
        return getGestureEventConfig(type);
      }
      return result;
    }

  };

  tabris.registerWidget = function(type, members) {
    members = util.extend({animate: tabris._Animation.animate}, tabris.Widgets, members);
    members._events = util.extend({}, tabris.registerWidget._defaultEvents, members._events || {});
    if (members._properties !== true) {
      var defaultProperties = tabris.registerWidget._defaultProperties;
      members._properties = util.extend({}, defaultProperties, members._properties || {});
    }
    tabris.registerType(type, members);
  };

  var hasAndroidResizeBug;
  tabris.load(function() {
    hasAndroidResizeBug = tabris.device.get("platform") === "Android" &&
                          tabris.device.get("version") <= 17;
  });

  util.extend(tabris.registerWidget, {
    _defaultEvents: tabris.registerType.normalizeEventsMap({
      touchstart: {trigger: triggerWithTarget},
      touchmove: {trigger: triggerWithTarget},
      touchend: {trigger: triggerWithTarget},
      touchcancel: {trigger: triggerWithTarget},
      "change:bounds": {
        name: "Resize",
        trigger: function(event) {
          if (hasAndroidResizeBug) {
            var self = this;
            setTimeout(function() {
              self._triggerChangeEvent("bounds", event.bounds);
            }, 0);
          } else {
            this._triggerChangeEvent("bounds", event.bounds);
          }
        }
      }
    }),
    _defaultProperties: tabris.registerType.normalizePropertiesMap({
      enabled: {
        type: "boolean",
        default: true
      },
      visible: {
        type: "boolean",
        default: true,
        set: function(value) {
          this._nativeSet("visibility", value);
        }
      },
      layoutData: {
        type: "layoutData",
        set: function(value) {
          this._layoutData = value;
          try {
            renderLayoutData.call(this);
          } catch (ex) {
            if (!this._layoutDataPending) {
              tabris._on("beforeFlush", renderLayoutListener, this);
              this._layoutDataPending = true;
            }
          }
        },
        get: function() {
          return this._layoutData || null;
        }
      },
      font: "font",
      backgroundImage: "image",
      bounds: {
        type: "bounds",
        set: function() {
          console.warn(this.type + ": Can not set read-only property \"bounds\".");
        },
        nocache: true
      },
      background: "color",
      foreground: "color",
      opacity: {
        type: "opacity",
        default: 1
      },
      transform: {
        type: "transform",
        default: function() {
          return {
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            translationX: 0,
            translationY: 0
          };
        }
      },
      highlightOnTouch: {
        type: "boolean",
        default: false
      },
      id: {
        type: "string",
        set: function(value) {
          this.id = value;
        },
        get: function() {
          return this.id;
        }
      },
      gestures: {
        set: function(gestures) {
          this._gestures = util.extend({}, defaultGestures, gestures);
        },
        get: function() {
          if (!this._gestures) {
            this._gestures = util.extend({}, defaultGestures);
          }
          return this._gestures;
        },
        nocache: true
      }
    })
  });

  var defaultGestures = {
    tap: {type: "tap"},
    longpress: {type: "longpress"},
    pan: {type: "pan"},
    "pan:left": {type: "pan", direction: "left"},
    "pan:right": {type: "pan", direction: "right"},
    "pan:up": {type: "pan", direction: "up"},
    "pan:down": {type: "pan", direction: "down"},
    "pan:horizontal": {type: "pan", direction: "horizontal"},
    "pan:vertical": {type: "pan", direction: "vertical"},
    "swipe:left": {type: "swipe", direction: "left"},
    "swipe:right": {type: "swipe", direction: "right"},
    "swipe:up": {type: "swipe", direction: "up"},
    "swipe:down": {type: "swipe", direction: "down"}
  };

  function renderLayoutListener() {
    try {
      renderLayoutData.call(this);
      tabris._off("beforeFlush", renderLayoutListener, this);
      delete this._layoutDataPending;
      delete this._hasPreliminaryLayout;
    } catch (ex) {
      if (!this._hasPreliminaryLayout) {
        renderLayoutData.call(this, true);
        this._hasPreliminaryLayout = true;

      }
    }
  }

  function renderLayoutData(force) {
    if (this._layoutData) {
      this._nativeSet("layoutData", tabris.Layout.encodeLayoutData(this._layoutData, this, force));
    } else {
      this._nativeSet("layoutData", null);
    }
  }

  function getGestureEventConfig(name) {
    return {
      listen: function(state) {
        var gestures = this.get("gestures");
        if (state) {
          var properties = util.extend({target: this}, gestures[name]);
          var recognizer = tabris.create("_GestureRecognizer", properties)
            .on("gesture", gestureListener, {target: this, name: name});
          if (!this._recognizers) {
            this._recognizers = {};
          }
          this._recognizers[name] = recognizer;
          this._on("dispose", recognizer.dispose, recognizer);
        } else {
          this._recognizers[name].dispose();
          delete this._recognizers[name];
        }
      }
    };
  }

  function gestureListener(event) {
    this.target.trigger(this.name, this.target, event);
  }

  function triggerWithTarget(event, name) {
    this.trigger(name, this, event || {});
  }

  tabris.registerWidget("Button", {
    _type: "rwt.widgets.Button",
    _initProperties: {style: ["PUSH"]},
    _events: {
      select: {
        name: "Selection",
        listen: function(state) {
          this._nativeListen("Selection", state);
        },
        trigger: function(event) {
          this.trigger("select", this, event);
        }
      }
    },
    _properties: {
      alignment: {type: ["choice", ["left", "right", "center"]], default: "center"},
      image: {type: "image", default: null},
      text: {type: "string", default: ""}
    }
  });

  tabris.registerWidget("Canvas", {
    _type: "rwt.widgets.Canvas",
    _supportsChildren: true
  });

  tabris.registerWidget("CheckBox", {
    _type: "rwt.widgets.Button",
    _initProperties: {style: ["CHECK"]},
    _events: {
      select: {
        name: "Selection",
        alias: "change:selection",
        trigger: function(event) {
          this._triggerChangeEvent("selection", event.selection);
          this.trigger("select", this, event.selection, {});
        }
      }
    },
    _properties: {
      text: {type: "string", default: ""},
      selection: {type: "boolean", nocache: true}
    }
  });

  tabris.registerWidget("Picker", {
    _type: "rwt.widgets.Combo",
    _initProperties: {selectionIndex: 0},
    _events: {
      select: {
        name: "Selection",
        alias: "change:selectionIndex",
        trigger: function(event) {
          this._triggerChangeEvent("selectionIndex", event.selectionIndex);
          this.trigger("select", this, event.selectionIndex, {});
        }
      }
    },
    _properties: {
      items: {type: true, default: function() {return [];}},
      text: "string", // TODO: readonly
      selectionIndex: {type: "natural", nocache: true}
    }
  });

  tabris.registerWidget("Composite", {
    _type: "rwt.widgets.Composite",
    _supportsChildren: true
  });

  tabris.registerWidget("ImageView", {
    _type: "tabris.ImageView",
    _properties: {
      image: {type: "image", default: null},
      scaleMode: {type: ["choice", ["auto", "fit", "fill", "stretch", "none"]], default: "auto"}
    }
  });

  tabris.registerWidget("TextView", {
    _type: "tabris.TextView",
    _properties: {
      alignment: {type: ["choice", ["left", "right", "center"]], default: "left"},
      markupEnabled: {type: "boolean", default: false}, // TODO: readonly
      maxLines: {
        type: ["nullable", "natural"],
        default: null,
        set: function(value) {
          this._nativeSet("maxLines", value <= 0 ? null : value);
        }
      },
      text: {type: "string", default: ""}
    }
  });

  tabris.registerWidget("ProgressBar", {
    _type: "rwt.widgets.ProgressBar",
    _properties: {
      minimum: {type: "integer", default: 0},
      maximum: {type: "integer", default: 100},
      selection: {type: "integer", default: 0},
      state: {type: ["choice", ["normal", "paused", "error"]], default: "normal"}
    }
  });

  tabris.registerWidget("RadioButton", {
    _type: "rwt.widgets.Button",
    _initProperties: {style: ["RADIO"]},
    _events: {
      select: {
        name: "Selection",
        alias: "change:selection",
        trigger: function(event) {
          this._triggerChangeEvent("selection", event.selection);
          this.trigger("select", this, event.selection, {});
        }
      }
    },
    _properties: {
      text: {type: "string", default: ""},
      selection: {type: "boolean", nocache: true}
    }
  });

  tabris.registerWidget("Slider", {
    _type: "rwt.widgets.Scale",
    _events: {
      select: {
        name: "Selection",
        alias: "change:selection",
        trigger: function(event) {
          this._triggerChangeEvent("selection", event.selection);
          this.trigger("select", this, event.selection, {});
        }
      }
    },
    _properties: {
      minimum: {type: "integer", default: 0},
      maximum: {type: "integer", default: 100},
      selection: {type: "integer", nocache: true}
    }
  });

  tabris.registerWidget("TextInput", {
    _type: "tabris.TextInput",
    _events: {
      focus: {trigger: triggerWithTarget},
      blur:  {trigger: triggerWithTarget},
      accept: {
        trigger: function(event) {
          this.trigger("accept", this, event.text, {});
        }
      },
      input: {
        name: "modify",
        alias: "change:text",
        trigger: function(event) {
          this._triggerChangeEvent("text", event.text);
          this.trigger("input", this, event.text, {});
        }
      }
    },
    _properties: {
      type: ["choice", ["default", "password", "search", "multiline"]],
      text: {type: "string", nocache: true},
      message: {type: "string", default: ""},
      editable: {type: "boolean", default: true},
      alignment: {type: ["choice", ["left", "center", "right"]], default: "left"},
      autoCorrect: {type: "boolean", default: false},
      autoCapitalize: {type: "boolean", default: false},
      keyboard: {
        type: ["choice", ["ascii", "decimal", "email", "number", "numbersAndPunctuation", "phone", "url", "default"]],
        default: "default"
      }
    }
  });

  tabris.registerWidget("ToggleButton", {
    _type: "rwt.widgets.Button",
    _initProperties: {style: ["TOGGLE"]},
    _events: {
      select: {
        name: "Selection",
        alias: "change:selection",
        trigger: function(event) {
          this._triggerChangeEvent("selection", event.selection);
          this.trigger("select", this, event.selection, {});
        }
      }
    },
    _properties: {
      text: {type: "string", default: ""},
      image: {type: "image", default: null},
      selection: {type: "boolean", nocache: true},
      alignment: {type: ["choice", ["left", "right", "center"]], default: "center"}
    }
  });

  tabris.registerWidget("Video", {
    _type: "tabris.widgets.Video",
    _initProperties: {controls_visible: true, repeat: false},
    _properties: {url: true}
  });

  tabris.registerWidget("WebView", {
    _type: "rwt.widgets.Browser",
    _events: {load: {name: "Progress", trigger: triggerWithTarget}},
    _properties: {
      url: {type: "string", nocache: true},
      html: {type: "string", nocache: true}
    }
  });

}());
