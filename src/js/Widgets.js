(function() {

  tabris.registerWidget = function(type, members) {
    members = util.extend(util.clone(members), tabris.Animation);
    members._listen = util.extend({}, tabris.registerWidget._defaultListen, members._listen || {});
    members._trigger = util.extend({}, tabris.registerWidget._defaultTrigger, members._trigger || {});
    members._setProperty = util.extend({}, tabris.registerWidget._defaultSetProperty, members._setProperty || {});
    members._getProperty = util.extend({}, tabris.registerWidget._defaultGetProperty, members._getProperty || {});
    if (members._properties !== true) {
      var defaultProperties = tabris.registerWidget._defaultProperties;
      members._properties = util.extend({}, defaultProperties, members._properties || {});
    }
    tabris.registerType(type, members);
  };

  util.extend(tabris.registerWidget, {
    _defaultListen: {
      touchstart: true,
      touchmove: true,
      touchend: true,
      touchcancel: true,
      longpress: true,
      dispose: function() {},
      "change:bounds": "Resize"
    },
    _defaultTrigger: {
      Resize: "change:bounds"
    },
    _defaultProperties: {
      enabled: "boolean",
      visible: "boolean",
      layoutData: "layoutData",
      font: "font",
      backgroundImage: "image",
      bounds: "bounds",
      background: "color",
      foreground: "color",
      opacity: true,
      transform: true,
      highlightOnTouch: "boolean",
      id: "string"
    },
    _defaultSetProperty: {
      visible: function(value) {
        this._nativeSet("visibility", value);
      },
      id: function(value) {
        this.id = value;
      },
      layoutData: function(value) {
        this._layoutData = value;
        try {
          renderLayoutData.call(this);
        } catch (ex) {
          if (!this._layoutDataPending) {
            tabris.on("beforeFlush", renderLayoutListener, this);
            this._layoutDataPending = true;
          }
        }
      }
    },
    _defaultGetProperty: {
      visible: function() {
        return this._nativeGet("visibility");
      },
      id: function() {
        return this.id;
      },
      layoutData: function() {
        return this._layoutData || null;
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

  tabris.registerWidget("Button", {
    _type: "rwt.widgets.Button",
    _initProperties: {style: ["PUSH"]},
    _listen: {selection: "Selection"},
    _trigger: {Selection: "selection"},
    _properties: {
      alignment: ["choice", ["left", "right", "center"]],
      image: "image",
      text: "string"
    }
  });

  tabris.registerWidget("Canvas", {
    _type: "rwt.widgets.Canvas",
    _listen: {addchild: function() {}, removechild: function() {}},
    _supportsChildren: true
  });

  tabris.registerWidget("CheckBox", {
    _type: "rwt.widgets.Button",
    _initProperties: {style: ["CHECK"]},
    _listen: {"change:selection": "Selection"},
    _trigger: {Selection: "change:selection"},
    _properties: {text: "string", selection: "boolean"}
  });

  tabris.registerWidget("Picker", {
    _type: "rwt.widgets.Combo",
    _listen: {"change:selection": "Selection"},
    _trigger: {Selection: "change:selection"},
    _properties: {items: true, text: "string", selectionIndex: "natural"}
  });
  tabris.Combo = tabris.Picker;

  tabris.registerWidget("Composite", {
    _type: "rwt.widgets.Composite",
    _listen: {addchild: function() {}, removechild: function() {}},
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
      maxLines: ["nullable", "natural"],
      text: "string"
    },
    _setProperty: {
      maxLines: function(value) {
        this._nativeSet("maxLines", value <= 0 ? null : value);
      }
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
    _listen: {"change:selection": "Selection"},
    _trigger: {Selection: "change:selection"},
    _properties: {text: "string", selection: "boolean"}
  });

  tabris.registerWidget("Slider", {
    _type: "rwt.widgets.Scale",
    _listen: {"change:selection": "Selection"},
    _trigger: {Selection: "change:selection"},
    _properties: {minimum: "integer", maximum: "integer", selection: "integer"}
  });

  tabris.registerWidget("TextInput", {
    _type: "tabris.TextInput",
    _listen: {
      focus: true,
      blur: true,
      accept: true,
      "change:text": "modify"
    },
    _trigger: {
      modify: "change:text"
    },
    _properties: {
      type: ["choice", ["default", "password", "search", "multiline"]],
      text: "string",
      message: "string",
      editable: "boolean",
      alignment: ["choice", ["left", "center", "right"]],
      autoCorrect: "boolean",
      autoCapitalize: "boolean",
      keyboard: ["choice", ["ascii", "decimal", "email", "number", "numbersAndPunctuation", "phone", "url"]]
    }
  });
  tabris.Text = tabris.TextInput;

  tabris.registerWidget("ToggleButton", {
    _type: "rwt.widgets.Button",
    _initProperties: {style: ["TOGGLE"]},
    _listen: {"change:selection": "Selection"},
    _trigger: {Selection: "change:selection"},
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
    _listen: {load: "Progress"},
    _trigger: {Progress: "load"},
    _properties: {url: true, html: "string"}
  });

}());
