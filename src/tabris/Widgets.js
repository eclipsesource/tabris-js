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
      return new tabris.ProxyCollection(this._getSelectableChildren(), selector);
    },

    find: function(selector) {
      return new tabris.ProxyCollection(this._getSelectableChildren(), selector, true);
    },

    apply: function(sheet) {
      var scope = new tabris.ProxyCollection(this._children.concat(this), "*", true);
      if (sheet["*"]) {
        scope.set(sheet["*"]);
      }
      var selector;
      for (selector in sheet) {
        if (selector !== "*" && selector[0] !== "#" && selector[0] !== ".") {
          scope.filter(selector).set(sheet[selector]);
        }
      }
      for (selector in sheet) {
        if (selector[0] === ".") {
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

    _getSelectableChildren: function() {
      return this._children;
    },

    _setParent: function(parent) {
      this._nativeSet("parent", tabris.PropertyTypes.proxy.encode(parent._getContainer(this)));
      if (this._parent) {
        this._parent._removeChild(this);
        tabris.Layout.addToQueue(this._parent);
      }
      this._parent = parent;
      this._parent._addChild(this);
      tabris.Layout.addToQueue(this._parent);
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

    _release: function() {
      if (this._children) {
        var children = this._children.concat();
        for (var i = 0; i < children.length; i++) {
          children[i]._dispose(true);
        }
        delete this._children;
      }
      if (this._parent) {
        this._parent._removeChild(this);
        tabris.Layout.addToQueue(this._parent);
        delete this._parent;
      }
    },

    _getEventConfig: function(type) {
      var result = tabris.Proxy.prototype._getEventConfig.call(this, type);
      if (!result && this.get("gestures")[type]) {
        return getGestureEventConfig(type);
      }
      return result;
    },

    _flushLayout: function() {
      if (this._children) {
        this._children.forEach(function(child) {
          renderLayoutData.call(child);
        });
      }
    },

    classList: {
      get length() {
        return 0;
      },
      indexOf: function() {
        return -1;
      },
      join: function() {
        return "";
      }
    }

  };

  tabris.registerWidget = function(type, members) {
    members = _.extend({animate: tabris._Animation.animate}, tabris.Widgets, members);
    members._events = _.extend({}, tabris.registerWidget._defaultEvents, members._events || {});
    if (members._properties !== true) {
      var defaultProperties = tabris.registerWidget._defaultProperties;
      members._properties = _.extend({}, defaultProperties, members._properties || {});
    }
    tabris.registerType(type, members);
  };

  var hasAndroidResizeBug;
  tabris.load(function() {
    hasAndroidResizeBug = tabris.device.get("platform") === "Android" &&
                          tabris.device.get("version") <= 17;
  });

  _.extend(tabris.registerWidget, {
    _defaultEvents: {
      touchstart: {trigger: triggerWithTarget},
      touchmove: {trigger: triggerWithTarget},
      touchend: {trigger: triggerWithTarget},
      touchcancel: {trigger: triggerWithTarget},
      "resize": {
        name: "Resize",
        alias: "change:bounds",
        trigger: function(event) {
          if (hasAndroidResizeBug) {
            var self = this;
            setTimeout(function() {
              self._triggerChangeEvent("bounds", event.bounds, {}, "resize");
              self.trigger("resize", self, tabris.PropertyTypes.bounds.decode(event.bounds), {});
            }, 0);
          } else {
            this._triggerChangeEvent("bounds", event.bounds, {}, "resize");
            this.trigger("resize", this, tabris.PropertyTypes.bounds.decode(event.bounds), {});
          }
        }
      }
    },
    _defaultProperties: tabris.registerType.normalizePropertiesMap({
      enabled: {
        type: "boolean",
        default: true
      },
      visible: {
        type: "boolean",
        default: true,
        access: {
          set: function(name, value, options) {
            this._nativeSet("visibility", value);
            this._storeProperty(name, value, options);
          }
        }
      },
      layoutData: {
        type: "layoutData",
        access: {
          set: function(name, value) {
            this._layoutData = value;
            renderLayoutData.call(this);
          },
          get: function() {
            return this._layoutData || null;
          }
        }
      },
      font: "font",
      backgroundImage: "image",
      bounds: {
        type: "bounds",
        access: {
          set: function() {
            console.warn(this.type + ": Can not set read-only property \"bounds\".");
          }
        }
      },
      background: "color",
      textColor: {
        type: "color",
        access: {
          set: function(name, value, options) {
            this._nativeSet("foreground", value);
            this._storeProperty(name, value, options);
          }
        }
      },
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
        access: {
          set: function(name, value) {
            this.id = value;
          },
          get: function() {
            return this.id;
          }
        }
      },
      class: {
        type: "string",
        access: {
          set: function(name, value) {
            this.classList = value.trim().split(/\s+/);
          },
          get: function() {
            return this.classList.join(" ");
          }
        }
      },
      gestures: {
        access: {
          set: function(name, gestures) {
            this._gestures = _.extend({}, defaultGestures, gestures);
          },
          get: function() {
            if (!this._gestures) {
              this._gestures = _.extend({}, defaultGestures);
            }
            return this._gestures;
          }
        }
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

  var isIOS = false;
  tabris.load(function() {
    isIOS = tabris.device.get("platform") === "iOS";
  });

  function renderLayoutData() {
    if (isIOS && this.type === "Page") {
      // Temporary workaround for #583. Rendering layoutData for Page can make it disappear in iOS.
      return;
    }
    if (this._layoutData) {
      this._nativeSet("layoutData", tabris.Layout.resolveReferences(this._layoutData, this));
    }
  }

  function getGestureEventConfig(name) {
    return {
      listen: function(state) {
        var gestures = this.get("gestures");
        if (state) {
          var properties = _.extend({target: this}, gestures[name]);
          var recognizer = tabris.create("_GestureRecognizer", properties)
            .on("gesture", gestureListener, {target: this, name: name});
          if (!this._recognizers) {
            this._recognizers = {};
          }
          this._recognizers[name] = recognizer;
          this._on("dispose", recognizer.dispose, recognizer);
        } else if (this._recognizers && name in this._recognizers) {
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
    _supportsChildren: true,
    getContext: function(type, width, height) {
      if (type === "2d") {
        return tabris.CanvasContext.getContext(this, width, height);
      }
      return null;
    }
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
        access: {
          set: function(name, value, options) {
            this._nativeSet(name, value <= 0 ? null : value);
            this._storeProperty(name, value, options);
          }
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
    _properties: {url: "string"}
  });

  tabris.registerWidget("WebView", {
    _type: "rwt.widgets.Browser",
    _events: {load: {name: "Progress", trigger: triggerWithTarget}},
    _properties: {
      url: {type: "string", nocache: true},
      html: {type: "string", nocache: true}
    }
  });

  tabris.registerWidget("Switch", {
    _type: "tabris.Switch",
    _events: {
      select: {
        name: "toggle",
        alias: "change:selection",
        trigger: function(event) {
          this._triggerChangeEvent("selection", event.checked);
          this.trigger("select", this, event.checked, {});
        }
      }
    },
    _properties: {
      type: "boolean",
      selection: {
        access: {
          get: function() {
            return this._nativeGet("checked");
          },
          set: function(name, value, options) {
            this._nativeSet("checked", value);
            this._triggerChangeEvent(name, value, options);
          }
        }
      }
    }
  });

}());
