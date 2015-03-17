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
      tabris._nativeBridge.set(
        this.cid, "parent",
        tabris.PropertyEncoding.proxy(parent._getContainer(this))
      );
      if (this._parent) {
        this._parent._removeChild(this);
      }
      this._parent = parent;
      this._parent._addChild(this);
    },

    _addChild: function(child) {
      var check = this.constructor && this.constructor._supportsChildren;
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
      this.trigger("addchild", child, this, {});
    },

    _removeChild: function(child) {
      if (this._children) {
        var index = this._children.indexOf(child);
        if (index !== -1) {
          this._children.splice(index, 1);
        }
        this.trigger("removechild", child, this, {index: index});
      }
    },

    _destroy: function() {
      disposeRecognizers.call(this);
      tabris.Proxy.prototype._destroy.call(this);
    },

    _destroyChildren: function() {
      if (this._children) {
        for (var i = 0; i < this._children.length; i++) {
          this._children[i]._destroy();
        }
      }
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
    _defaultEvents: {
      touchstart: true,
      touchmove: true,
      touchend: true,
      touchcancel: true,
      longpress: true,
      "change:bounds": {
        name: "Resize",
        trigger: function(event) {
          if (hasAndroidResizeBug) {
            var self = this;
            setTimeout(function() {
              self.trigger("change:bounds", event);
            }, 0);
          } else {
            this.trigger("change:bounds", event);
          }
        }
      }
    },
    _defaultProperties: {
      enabled: "boolean",
      visible: {
        type: "boolean",
        set: function(value) {
          this._nativeSet("visibility", value);
        },
        get: function() {
          return this._nativeGet("visibility");
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
              tabris.on("beforeFlush", renderLayoutListener, this);
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
        }
      },
      background: "color",
      foreground: "color",
      opacity: true,
      transform: true,
      highlightOnTouch: "boolean",
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
          this._gestures = gestures;
          disposeRecognizers.call(this);
          this._recognizers = [];
          for (var name in gestures) {
            var properties = util.extend({target: this}, gestures[name]);
            var recognizer = tabris.create("_GestureRecognizer", properties)
              .on("gesture", gestureListener, {target: this, name: name});
            this._recognizers.push(recognizer);
          }
        },
        get: function() {
          return this._gestures || {};
        }
      }
    }
  });

  function renderLayoutListener() {
    try {
      renderLayoutData.call(this);
      tabris.off("beforeFlush", renderLayoutListener, this);
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

  function disposeRecognizers() {
    (this._recognizers || []).forEach(function(recognizer) {
      recognizer.dispose();
    });
  }

  function gestureListener(event) {
    this.target.trigger(this.name, event);
  }

  tabris.registerWidget("Button", {
    _type: "rwt.widgets.Button",
    _initProperties: {style: ["PUSH"]},
    _events: {selection: "Selection"},
    _properties: {
      alignment: ["choice", ["left", "right", "center"]],
      image: "image",
      text: "string"
    }
  });

  tabris.registerWidget("Canvas", {
    _type: "rwt.widgets.Canvas",
    _supportsChildren: true
  });

  tabris.registerWidget("CheckBox", {
    _type: "rwt.widgets.Button",
    _initProperties: {style: ["CHECK"]},
    _events: {"change:selection": "Selection"},
    _properties: {text: "string", selection: "boolean"}
  });

  tabris.registerWidget("Picker", {
    _type: "rwt.widgets.Combo",
    _events: {"change:selection": "Selection"},
    _properties: {items: true, text: "string", selectionIndex: "natural"}
  });
  tabris.Combo = tabris.Picker;

  tabris.registerWidget("Composite", {
    _type: "rwt.widgets.Composite",
    _supportsChildren: true
  });

  tabris.registerWidget("ImageView", {
    _type: "tabris.ImageView",
    _properties: {
      image: "image",
      scaleMode: ["choice", ["auto", "fit", "fill", "stretch", "none"]]
    }
  });

  tabris.registerWidget("TextView", {
    _type: "tabris.TextView",
    _properties: {
      alignment: ["choice", ["left", "right", "center"]],
      markupEnabled: "boolean",
      maxLines: {
        type: ["nullable", "natural"],
        set: function(value) {
          this._nativeSet("maxLines", value <= 0 ? null : value);
        }
      },
      text: "string"
    }
  });
  tabris.Label = tabris.TextView;

  tabris.registerWidget("ProgressBar", {
    _type: "rwt.widgets.ProgressBar",
    _properties: {
      minimum: "integer",
      maximum: "integer",
      selection: "integer",
      state: ["choice", ["normal", "paused", "error"]]
    }
  });

  tabris.registerWidget("RadioButton", {
    _type: "rwt.widgets.Button",
    _initProperties: {style: ["RADIO"]},
    _events: {"change:selection": "Selection"},
    _properties: {text: "string", selection: "boolean"}
  });

  tabris.registerWidget("Slider", {
    _type: "rwt.widgets.Scale",
    _events: {"change:selection": "Selection"},
    _properties: {minimum: "integer", maximum: "integer", selection: "integer"}
  });

  tabris.registerWidget("TextInput", {
    _type: "tabris.TextInput",
    _events: {
      focus: true,
      blur: true,
      accept: true,
      "change:text": "modify"
    },
    _properties: {
      type: ["choice", ["default", "password", "search", "multiline"]],
      text: "string",
      message: "string",
      editable: "boolean",
      alignment: ["choice", ["left", "center", "right"]],
      autoCorrect: "boolean",
      autoCapitalize: "boolean",
      keyboard: ["choice", ["ascii", "decimal", "email", "number", "numbersAndPunctuation", "phone", "url", "default"]]
    }
  });
  tabris.Text = tabris.TextInput;

  tabris.registerWidget("ToggleButton", {
    _type: "rwt.widgets.Button",
    _initProperties: {style: ["TOGGLE"]},
    _events: {"change:selection": "Selection"},
    _properties: {
      text: "string",
      image: "image",
      selection: "boolean",
      alignment: ["choice", ["left", "right", "center"]]
    }
  });

  tabris.registerWidget("Video", {
    _type: "tabris.widgets.Video",
    _initProperties: {controls_visible: true, repeat: false},
    _properties: {url: true}
  });

  tabris.registerWidget("WebView", {
    _type: "rwt.widgets.Browser",
    _events: {load: "Progress"},
    _properties: {url: true, html: "string"}
  });

}());
