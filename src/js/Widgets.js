/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  var checks = tabris.PropertyChecks;
  var encoding = tabris.PropertyEncoding;

  tabris.registerWidget = function(type, members) {
    members = util.clone(members);
    members._listen = util.extend({}, tabris.registerWidget._defaultListen, members._listen || {});
    members._trigger = util.extend({}, tabris.registerWidget._defaultTrigger, members._trigger || {});
    members._setProperty = util.extend({}, tabris.registerWidget._defaultSetProperty, members._setProperty || {});
    members._getProperty = util.extend({}, tabris.registerWidget._defaultGetProperty, members._getProperty || {});
    if (members._checkProperty !== true) {
      var defaultCheckProperty = tabris.registerWidget._defaultCheckProperty;
      members._checkProperty = util.extend({}, defaultCheckProperty, members._checkProperty || {});
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
      enabled: true,
      visibility: true,
      layoutData: checks.layoutData,
      font: true,
      backgroundImage: checks.image,
      bounds: true,
      background: true,
      foreground: true,
      opacity: true,
      transform: true,
      highlightOnTouch: true
    },
    _defaultSetProperty: {
      foreground: function(value) {
        this._setPropertyNative("foreground", encoding.encodeColor(value));
      },
      background: function(value) {
        this._setPropertyNative("background", encoding.encodeColor(value));
      },
      font: function(value) {
        this._setPropertyNative("font", encoding.encodeFont(value));
      },
      image: function(value) {
        this._setPropertyNative("image", encoding.encodeImage(value));
      },
      backgroundImage: function(value) {
        this._setPropertyNative("backgroundImage", encoding.encodeImage(value));
      },
      layoutData: function(value) {
        this._setPropertyNative("layoutData", encoding.encodeLayoutData(value));
      },
      bounds: function(value) {
        this._setPropertyNative("bounds", encoding.encodeBounds(value));
      }
    },
    _defaultGetProperty: {
      foreground: function() {
        return encoding.decodeColor(this._getPropertyNative("foreground"));
      },
      background: function() {
        return encoding.decodeColor(this._getPropertyNative("background"));
      },
      font: function() {
        return encoding.decodeFont(this._getPropertyNative("font"));
      },
      image: function() {
        return encoding.decodeImage(this._getPropertyNative("image"));
      },
      backgroundImage: function() {
        return encoding.decodeImage(this._getPropertyNative("backgroundImage"));
      },
      bounds: function() {
        return encoding.decodeBounds(this._getPropertyNative("bounds"));
      }
    }
  });

  tabris.registerWidget("Button", {
    _type: "rwt.widgets.Button",
    _internalProperties: {style: ["PUSH"]},
    _listen: {selection: "Selection"},
    _trigger: {Selection: "selection"},
    _checkProperty: {alignment: true, image: true, text: true}
  });

  tabris.registerWidget("Canvas", {
    _type: "rwt.widgets.Canvas",
    _supportsChildren: true
  });

  tabris.registerWidget("CheckBox", {
    _type: "rwt.widgets.Button",
    _internalProperties: {style: ["CHECK"]},
    _listen: {"change:selection": "Selection"},
    _trigger: {Selection: "change:selection"},
    _checkProperty: {text: true, selection: true}
  });

  tabris.registerWidget("Combo", {
    _type: "rwt.widgets.Combo",
    _listen: {"change:selection": "Selection"},
    _trigger: {Selection: "change:selection"},
    _checkProperty: {items: true, text: true, selectionIndex: true}
  });

  tabris.registerWidget("Composite", {
    _type: "rwt.widgets.Composite",
    _supportsChildren: true
  });

  tabris.registerWidget("ImageView", {
    _type: "tabris.ImageView",
    _checkProperty: {image: checks.image, scaleMode: true}
  });

  tabris.registerWidget("Label", {
    _type: "rwt.widgets.Label",
    _internalProperties: {style: ["WRAP"]},
    _checkProperty: {alignment: true, markupEnabled: true, text: true}
  });

  tabris.registerWidget("ProgressBar", {
    _type: "rwt.widgets.ProgressBar",
    _checkProperty: {minimum: true, maximum: true, selection: true, state: true}
  });

  tabris.registerWidget("RadioButton", {
    _type: "rwt.widgets.Button",
    _internalProperties: {style: ["RADIO"]},
    _listen: {"change:selection": "Selection"},
    _trigger: {Selection: "change:selection"},
    _checkProperty: {text: true, selection: true}
  });

  tabris.registerWidget("Slider", {
    _type: "rwt.widgets.Scale",
    _listen: {"change:selection": "Selection"},
    _trigger: {Selection: "change:selection"},
    _checkProperty: {minimum: true, maximum: true, selection: true}
  });

  tabris.registerWidget("Text", {
    _type: "rwt.widgets.Text",
    _create: function(properties) {
      var style = textTypeToStyle[properties.type] || textTypeToStyle["default"];
      var result = this.super("_create", properties);
      this._setPropertyNative("style", style);
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
    _checkProperty: {type: true, text: true, message: true, editable: true, textLimit: true}
  });

  var textTypeToStyle = {
    password: ["BORDER", "SINGLE", "PASSWORD"],
    search: ["BORDER", "SINGLE", "SEARCH"],
    multiline: ["BORDER", "MULTI"],
    default: ["BORDER", "SINGLE"]
  };

  tabris.registerWidget("ToggleButton", {
    _type: "rwt.widgets.Button",
    _internalProperties: {style: ["TOGGLE"]},
    _listen: {"change:selection": "Selection"},
    _trigger: {Selection: "change:selection"},
    _checkProperty: {text: true, image: true, selection: true, alignment: true}
  });

  tabris.registerWidget("Video", {
    _type: "tabris.widgets.Video",
    _internalProperties: {controls_visible: true, repeat: false},
    _checkProperty: {url: true}
  });

  tabris.registerWidget("WebView", {
    _type: "rwt.widgets.Browser",
    _listen: {load: "Progress"},
    _trigger: {Progress: "load"},
    _checkProperty: {url: true, html: true}
  });

}());
