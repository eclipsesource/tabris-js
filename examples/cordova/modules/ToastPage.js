var PluginPage = require("./PluginPage");

var page = new PluginPage("Toast", "nl.x-services.plugins.toast", function(parent) {

  var input = tabris.create("TextInput", {
    text: "your message",
    layoutData: {left: 10, top: 10, right: 10}
  }).appendTo(parent);

  var buttonShortTop = tabris.create("Button", {
    layoutData: {left: 10, top: [input, 10], right: 10},
    text: "Show short top"
  }).appendTo(parent).on("select", function() {
    var text = input.get("text");
    window.plugins.toast.showShortTop(text);
  });

  var buttonShortCenter = tabris.create("Button", {
    layoutData: {left: 10, top: [buttonShortTop, 10], right: 10},
    text: "Show short center"
  }).appendTo(parent).on("select", function() {
    var text = input.get("text");
    window.plugins.toast.showShortCenter(text);
  });

  var buttonShortBottom = tabris.create("Button", {
    layoutData: {left: 10, top: [buttonShortCenter, 10], right: 10},
    text: "Show short bottom"
  }).appendTo(parent).on("select", function() {
    var text = input.get("text");
    window.plugins.toast.showShortBottom(text);
  });

  var buttonLongTop = tabris.create("Button", {
    layoutData: {left: 10, top: [buttonShortBottom, 10], right: 10},
    text: "Show long top"
  }).appendTo(parent).on("select", function() {
    var text = input.get("text");
    window.plugins.toast.showLongTop(text);
  });

  var buttonLongCenter = tabris.create("Button", {
    layoutData: {left: 10, top: [buttonLongTop, 10], right: 10},
    text: "Show long center"
  }).appendTo(parent).on("select", function() {
    var text = input.get("text");
    window.plugins.toast.showLongCenter(text);
  });

  tabris.create("Button", {
    layoutData: {left: 10, top: [buttonLongCenter, 10], right: 10},
    text: "Show long bottom"
  }).appendTo(parent).on("select", function() {
    var text = input.get("text");
    window.plugins.toast.showLongBottom(text);
  });

});

module.exports = page;
