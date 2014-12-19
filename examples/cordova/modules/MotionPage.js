var PluginPage = require("./PluginPage");

var page = new PluginPage("Motion", "org.apache.cordova.device-motion", function(parent) {

  var watchID = "";

  var buttonWatch = tabris.create("Button", {
    layoutData: {left: 10, top: 10, right: 10},
    text: "Start Watch Acceleration"
  }).appendTo(parent).on("selection", function() {
    var onSuccess = function(acceleration) {
      label.set("text", "Acceleration X: " + acceleration.x + "\n" +
                        "Acceleration Y: " + acceleration.y + "\n" +
                        "Acceleration Z: " + acceleration.z + "\n" +
                        "Timestamp: "      + acceleration.timestamp + "\n");
    };

    var onError = function() {
      console.log("onError!");
    };

    var options = {frequency: 700};  // Update every 700ms

    watchID = navigator.accelerometer.watchAcceleration(onSuccess, onError, options);
  });

  var buttonStopWatch = tabris.create("Button", {
    layoutData: {left: 10, top: [buttonWatch, 10], right: 10},
    text: "Stop Watch Acceleration"
  }).appendTo(parent).on("selection", function() {
    navigator.accelerometer.clearWatch(watchID);
  });

  var label = tabris.create("Label", {
    layoutData: {top: [buttonStopWatch, 20], left: 20, right: 20, bottom: 20}
  }).appendTo(parent);
});

module.exports = page;
