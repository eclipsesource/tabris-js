var PluginPage = require("./PluginPage");

var page = new PluginPage("Media", "cordova-media", function(parent) {

  var path = tabris.app.getResourceLocation("audio/media.wav");
  if (tabris.device.get("platform") === "iOS") {
    path = path.substr(path.indexOf("/www/") + 5);
  }

  var media = new Media(path, function() {
    console.log("Audio file loaded successfully");
  }, function(err) {
    console.log("Unable to play audio file: " + err.code + " - " + err.message);
  });

  tabris.create("Button", {
    layoutData: {left: 10, top: 10, right: 10},
    text: "Play"
  }).appendTo(parent).on("select", function() {
    media.play();
  });

  parent.on("dispose", function() {
    media.stop();
    media.release();
  });

});

module.exports = page;
