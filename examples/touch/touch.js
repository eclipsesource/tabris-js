tabris.load(function() {

  var colors = {
    blue: ["#4444FF", "#AAAAFF"],
    red: ["#EE3333", "#FFAAAA"],
    green: ["#33EE33", "#AAFFAA"]
  };

  var printXY = function(label, prefix, event) {
    label.set("text", prefix + ": " + event.x + " X " + event.y);
  };

  var blue = tabris.createPage({
    title: "Touch Events",
    topLevel: true,
    background: colors.blue[0]
  });

  var red = blue.append("Composite", {
    layoutData: {left: 30, right: 30, top: 60, bottom: [50, 0]},
    background: colors.red[0]
  }).on("touchstart", function(event) {
    printXY(redLabel, "touchstart", event);
    red.set("background", colors.red[1]);
  }).on("touchmove", function(event) {
    printXY(redLabel, "touchmove", event);
  }).on("touchend", function(event) {
    printXY(redLabel, "touchend", event);
    red.set("background", colors.red[0]);
  }).on("longpress", function(event) {
    printXY(redLabel, "longpress", event);
  });

  var green = blue.append("Composite", {
    layoutData: {left: 30, right: 30, top: [50, 30], bottom: 30},
    background: colors.green[0]
  }).on("touchstart", function(event) {
    printXY(greenLabel, "touchstart", event);
    green.set("background", colors.green[1]);
  }).on("touchmove", function(event) {
    printXY(greenLabel, "touchmove", event);
  }).on("touchend", function(event) {
    printXY(greenLabel, "touchend", event);
    green.set("background", colors.green[0]);
  }).on("longpress", function(event) {
    printXY(greenLabel, "longpress", event);
  });

  blue.on("touchstart", function(event) {
    printXY(blueLabel, "touchstart", event);
    blue.set("background", colors.blue[1]);
  }).on("touchmove", function(event) {
    printXY(blueLabel, "touchmove", event);
  }).on("touchend", function(event) {
    printXY(blueLabel, "touchend", event);
    blue.set("background", colors.blue[0]);
  }).on("longpress", function(event) {
    printXY(blueLabel, "longpress", event);
  });

  var blueLabel = blue.append("Label", {font: "20px sans-serif"});
  var redLabel = red.append("Label", {font: "20px sans-serif"});
  var greenLabel = green.append("Label", {font: "20px sans-serif"});

  blue.open();

});
