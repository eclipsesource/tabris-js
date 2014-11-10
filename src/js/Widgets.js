/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  tabris.registerWidget = function(type, members) {
    members = util.clone(members);
    members._listen = util.extend({}, tabris.registerWidget._defaultListen, members._listen || {});
    members._trigger = util.extend({}, tabris.registerWidget._defaultTrigger, members._trigger || {});
    if (members._checkProperty !== true) {
      members._checkProperty = util.extend({}, tabris.registerWidget._defaultCheckProperty, members._checkProperty || {});
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
      layoutData: true,
      font: true,
      backgroundImage: true,
      bounds: true,
      background: true,
      foreground: true,
      opacity: true,
      transform: true,
      highlightOnTouch: true
    }
  });

  tabris.registerWidget("Button", {
    _type: "rwt.widgets.Button",
    _properties: {style: ["PUSH"]},
    _listen: {selection: "Selection"},
    _trigger: {Selection: "selection"},
    _checkProperty: {alignment: true, image: true, text: true, style: true}
  });

  tabris.registerWidget("Canvas", {
    _type: "rwt.widgets.Canvas",
    _supportsChildren: true
  });

  tabris.registerWidget("CheckBox", {
    _type: "rwt.widgets.Button",
    _properties: {style: ["CHECK"]},
    _listen: {"change:selection": "Selection"},
    _trigger: {Selection: "change:selection"},
    _checkProperty: {image: true, text: true, selection: true, style: true}
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
    _checkProperty: {image: true, scaleMode: true}
  });

  tabris.registerWidget("Label", {
    _type: "rwt.widgets.Label",
    _properties: {style: ["WRAP"]},
    _checkProperty: {alignment: true, markupEnabled: true, text: true, style: true}
  });

  tabris.registerWidget("ProgressBar", {
    _type: "rwt.widgets.ProgressBar",
    _checkProperty: {minimum: true, maximum: true, selection: true, state: true}
  });

  tabris.registerWidget("RadioButton", {
    _type: "rwt.widgets.Button",
    _properties: {style: ["RADIO"]},
    _listen: {"change:selection": "Selection"},
    _trigger: {Selection: "change:selection"},
    _checkProperty: {text: true, image: true, selection: true, style: true}
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
      return this.super("_create", util.extend({style: style}, properties));
    },
    _listen: {focus: "FocusIn", blur: "FocusOut", accept: "DefaultSelection"},
    _trigger: {FocusIn: "focus", FocusOut: "blur", DefaultSelection: "accept"},
    _checkProperty: {type: true, text: true, message: true, editable: true, textLimit: true, style: true}
  });

  var textTypeToStyle = {
    password: ["BORDER", "SINGLE", "PASSWORD"],
    search: ["BORDER", "SINGLE", "SEARCH"],
    multiline: ["BORDER", "MULTI"],
    default: ["BORDER", "SINGLE"]
  };

  tabris.registerWidget("ToggleButton", {
    _type: "rwt.widgets.Button",
    _properties: {style: ["TOGGLE"]},
    _listen: {"change:selection": "Selection"},
    _trigger: {Selection: "change:selection"},
    _checkProperty: {text: true, image: true, selection: true, alignment: true, style: true}
  });

  tabris.registerWidget("WebView", {
    _type: "rwt.widgets.Browser",
    _listen: {load: "Progress"},
    _trigger: {Progress: "load"},
    _checkProperty: {url: true}
  });

}());
