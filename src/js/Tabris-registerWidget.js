/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  tabris.registerWidget = function(type, members) {
    members = util.clone(members);
    members._listen = util.extend({}, tabris.registerWidget._defaultListen, members._listen || {});
    members._trigger = util.extend({}, tabris.registerWidget._defaultTrigger, members._trigger || {});
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
    }
  });

  tabris.registerWidget("Button", {
    _type: "rwt.widgets.Button",
    _properties: {style: ["PUSH"]},
    _listen: {selection: "Selection"},
    _trigger: {Selection: "selection"}
  });

  tabris.registerWidget("Canvas", {
    _type: "rwt.widgets.Canvas"
  });

  tabris.registerWidget("CheckBox", {
    _type: "rwt.widgets.Button",
    _properties: {style: ["CHECK"]},
    _listen: {"change:selection": "Selection"},
    _trigger: {Selection: "change:selection"}
  });

  tabris.registerWidget("Combo", {
    _type: "rwt.widgets.Combo",
    _listen: {"change:selection": "Selection"},
    _trigger: {Selection: "change:selection"}
  });

  tabris.registerWidget("Composite", {
    _type: "rwt.widgets.Composite"
  });

  tabris.registerWidget("ImageView", {
    _type: "tabris.ImageView"
  });

  tabris.registerWidget("Label", {
    _type: "rwt.widgets.Label"
  });

  tabris.registerWidget("ProgressBar", {
    _type: "rwt.widgets.ProgressBar"
  });

  tabris.registerWidget("RadioButton", {
    _type: "rwt.widgets.Button",
    _properties: {style: ["RADIO"]},
    _listen: {"change:selection": "Selection"},
    _trigger: {Selection: "change:selection"}
  });

  tabris.registerWidget("_ScrollBar", {
    _type: "rwt.widgets.ScrollBar",
    _listen: {Selection: true}
  });

  tabris.registerWidget("Slider", {
    _type: "rwt.widgets.Scale",
    _listen: {"change:selection": "Selection"},
    _trigger: {Selection: "change:selection"}
  });

  tabris.registerWidget("Text", {
    _type: "rwt.widgets.Text",
    _create: function(properties) {
      var style = textTypeToStyle[properties.type] || textTypeToStyle["default"];
      return this.super("_create", util.extend({style: style}, properties));
    },
    _listen: {focusin: "FocusIn", focusout: "FocusOut", accept: "DefaultSelection"},
    _trigger: {FocusIn: "focusin", FocusOut: "focusout", DefaultSelection: "accept"}
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
    _trigger: {Selection: "change:selection"}
  });

  tabris.registerWidget("WebView", {
    _type: "rwt.widgets.Browser"
  });

}());
