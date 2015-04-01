var PluginPage = require("./PluginPage");

var page = new PluginPage("Badge", "de.appplant.cordova.plugin.badge", function(parent) {

  var input = tabris.create("TextInput", {
    text: "23",
    layoutData: {left: 10, top: 10, right: 10}
  }).appendTo(parent);

  tabris.create("Button", {
    layoutData: {left: 10, top: [input, 10], right: 10},
    text: "Set Badge"
  }).appendTo(parent).on("select", function() {
    var badge = input.get("text");
    cordova.plugins.notification.badge.set(badge);
  });

});

module.exports = page;
