(function(require) {

  var util = require("tabris-util");

  tabris.registerWidget = function(type, members) {
    members = util.clone(members);
    members._listen = util.extend({}, tabris.registerWidget._defaultListen, members._listen || {});
    members._trigger = util.extend({}, tabris.registerWidget._defaultTrigger, members._trigger || {});
    members._setProperty = util.extend({}, tabris.registerWidget._defaultSetProperty, members._setProperty || {});
    members._getProperty = util.extend({}, tabris.registerWidget._defaultGetProperty, members._getProperty || {});
    if (members._properties !== true) {
      var defaultCheckProperty = tabris.registerWidget._defaultCheckProperty;
      members._properties = util.extend({}, defaultCheckProperty, members._properties || {});
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
    _defaultCheckProperty: {
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
      }
    },
    _defaultGetProperty: {
      visible: function() {
        return this._nativeGet("visibility");
      },
      id: function() {
        return this.id;
      }
    }
  });

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

  tabris.registerWidget("Combo", {
    _type: "rwt.widgets.Combo",
    _listen: {"change:selection": "Selection"},
    _trigger: {Selection: "change:selection"},
    _properties: {items: true, text: "string", selectionIndex: "natural"}
  });

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

  tabris.registerWidget("Label", {
    _type: "rwt.widgets.Label",
    _initProperties: {style: ["WRAP"]},
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
    _type: "rwt.widgets.Text",
    _create: function(properties) {
      var style = textTypeToStyle[properties.type] || textTypeToStyle["default"];
      var result = this.super("_create", properties);
      this._nativeSet("style", style);
      return result;
    },
    _listen: {
      focus: "FocusIn",
      blur: "FocusOut",
      accept: "DefaultSelection",
      "change:text": "Modify"
    },
    _trigger: {
      FocusIn: "focus",
      FocusOut: "blur",
      DefaultSelection: "accept",
      Modify: "change:text"
    },
    _properties: {
      type: ["choice", ["default", "password", "search", "multiline"]],
      text: "string",
      message: "string",
      editable: "boolean",
      textLimit: "natural"
    }
  });
  tabris.Text = tabris.TextInput;

  var textTypeToStyle = {
    password: ["BORDER", "SINGLE", "PASSWORD"],
    search: ["BORDER", "SINGLE", "SEARCH"],
    multiline: ["BORDER", "MULTI"],
    default: ["BORDER", "SINGLE"]
  };

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

}(tabris.Module.require));
