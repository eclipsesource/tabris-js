(function() {

  tabris.Widget = function() {
    throw new Error("Cannot instantiate abstract Widget");
  };

  var superProto = tabris.Proxy.prototype;

  tabris.Widget.prototype = _.extendPrototype(tabris.Proxy, {

    append: function() {
      this._checkDisposed();
      var accept = function(proxy) {
        if (!(proxy instanceof tabris.Proxy)) {
          throw new Error("Cannot append non-widget");
        }
        proxy._setParent(this);
      }.bind(this);
      if (arguments[0] instanceof tabris.ProxyCollection) {
        arguments[0].toArray().forEach(accept);
      } else if (Array.isArray(arguments[0])) {
        arguments[0].forEach(accept);
      } else {
        Array.prototype.forEach.call(arguments, accept);
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

    insertBefore: function(proxy) {
      this._checkDisposed();
      proxy = proxy instanceof tabris.ProxyCollection ? proxy.first() : proxy;
      if (!(proxy instanceof tabris.Proxy)) {
        throw new Error("Cannot insert before non-widget");
      }
      var parent = proxy.parent();
      var index = parent._children.indexOf(proxy);
      this._setParent(parent, index);
      return this;
    },

    insertAfter: function(proxy) {
      this._checkDisposed();
      proxy = proxy instanceof tabris.ProxyCollection ? proxy.first() : proxy;
      if (!(proxy instanceof tabris.Proxy)) {
        throw new Error("Cannot insert after non-widget");
      }
      var parent = proxy.parent();
      var index = parent._children.indexOf(proxy);
      this._setParent(parent, index + 1);
      return this;
    },

    parent: function() {
      return this._parent;
    },

    children: function(selector) {
      return new tabris.ProxyCollection(this._getSelectableChildren(), selector);
    },

    siblings: function(selector) {
      var siblings = (this._parent ? this._parent._getSelectableChildren() : []);
      var filtered = siblings.filter(function(widget) {
        return widget !== this;
      }.bind(this));
      return new tabris.ProxyCollection(filtered, selector);
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

    _setParent: function(parent, index) {
      this._nativeSet("parent", tabris.PropertyTypes.proxy.encode(parent._getContainer(this)));
      if (this._parent) {
        this._parent._removeChild(this);
        tabris.Layout.addToQueue(this._parent);
      }
      this._parent = parent;
      this._parent._addChild(this, index);
      tabris.Layout.addToQueue(this._parent);
    },

    _addChild: function(child, index) {
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
      if (typeof index === "number") {
        this._children.splice(index, 0, child);
      } else {
        this._children.push(child);
      }
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
      var result = superProto._getEventConfig.apply(this, arguments);
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

    animate: tabris._Animation.animate

  });

  tabris.registerWidget = function(type, members) {
    members = _.extend({}, members);
    members._events = _.extend({}, tabris.registerWidget._defaultEvents, members._events || {});
    if (members._properties !== true) {
      var defaultProperties = tabris.registerWidget._defaultProperties;
      members._properties = _.extend({}, defaultProperties, members._properties || {});
    }
    tabris.registerType(type, members, tabris.Widget);
  };

  Object.defineProperty(tabris.Widget.prototype, "classList", {
    get: function() {
      if (!this._classList) {
        this._classList = [];
      }
      return this._classList;
    }
  });

  var hasAndroidResizeBug;
  tabris.load(function() {
    hasAndroidResizeBug = device.platform === "Android" && device.version <= 17;
  });

  var layoutAccess = {
    set: function(name, value) {
      if (!this._layoutData) {
        this._layoutData = {};
      }
      if (value == null) {
        delete this._layoutData[name];
      } else {
        this._layoutData[name] = value;
      }
      if (this._parent) {
        tabris.Layout.addToQueue(this._parent);
      }
    },
    get: function(name) {
      return this._layoutData && this._layoutData[name] != null ? this._layoutData[name] : null;
    }
  };

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
    _defaultProperties: {
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
            if (this._parent) {
              tabris.Layout.addToQueue(this._parent);
            }
          },
          get: function() {
            return this._layoutData || null;
          }
        }
      },
      left: {type: "edge", access: layoutAccess},
      right: {type: "edge", access: layoutAccess},
      top: {type: "edge", access: layoutAccess},
      bottom: {type: "edge", access: layoutAccess},
      width: {type: "dimension", access: layoutAccess},
      height: {type: "dimension", access: layoutAccess},
      centerX: {type: "dimension", access: layoutAccess},
      centerY: {type: "dimension", access: layoutAccess},
      baseline: {type: "sibling", access: layoutAccess},
      elevation: {
        type: "number",
        default: 0
      },
      font: {
        type: "font",
        access: {
          set: function(name, value, options) {
            this._nativeSet(name, value === undefined ? null : value);
            this._storeProperty(name, value, options);
          }
        },
        default: null
      },
      backgroundImage: "image",
      bounds: {
        type: "bounds",
        access: {
          set: function() {
            console.warn(this.type + ": Can not set read-only property \"bounds\".");
          }
        }
      },
      background: {
        type: "color",
        access: {
          set: function(name, value, options) {
            this._nativeSet(name, value === undefined ? null : value);
            this._storeProperty(name, value, options);
          }
        }
      },
      textColor: {
        type: "color",
        access: {
          set: function(name, value, options) {
            this._nativeSet("foreground", value === undefined ? null : value);
            this._storeProperty(name, value, options);
          },
          get: function(name) {
            var result = this._getStoredProperty(name);
            if (result === undefined) {
              result = this._nativeGet("foreground");
            }
            return result;
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
            translationY: 0,
            translationZ: 0
          };
        }
      },
      highlightOnTouch: {
        type: "boolean",
        default: false
      },
      cornerRadius: {
        type: "number",
        default: 0
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
            this._classList = value.trim().split(/\s+/);
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
      },
      win_theme: {
        type: ["choice", ["default", "light", "dark"]],
        default: "default"
      }
    }
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

  function renderLayoutData() {
    if (this._layoutData) {
      var checkedData = tabris.Layout.checkConsistency(this._layoutData);
      this._nativeSet("layoutData", tabris.Layout.resolveReferences(checkedData, this));
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

}());
