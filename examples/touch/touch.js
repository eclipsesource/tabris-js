tabris.load(function() {

  var colors = {
    blue: ["#4444FF", "#AAAAFF"],
    red: ["#EE3333", "#FFAAAA"],
    green: ["#33EE33", "#AAFFAA"]
  };

  var printXY = function(label, prefix, event) {
    label.set("text", prefix + ": " + event.touches[0].x + " X " + event.touches[0].y);
  };

  var bluePage = tabris.create("Page", {
    title: "Touch Events",
    topLevel: true,
    background: colors.blue[0]
  });

  var redComposite = tabris.create("Composite", {
    layoutData: {left: 30, right: 30, top: 60, bottom: [50, 0]},
    background: colors.red[0]
  });

  var greenComposite = tabris.create("Composite", {
    layoutData: {left: 30, right: 30, top: [50, 30], bottom: 30},
    background: colors.green[0]
  });

  var blueLabel = tabris.create("Label", {font: "20px sans-serif"});
  var redLabel = tabris.create("Label", {font: "20px sans-serif"});
  var greenLabel = tabris.create("Label", {font: "20px sans-serif"});

  redComposite.append(redLabel);
  greenComposite.append(greenLabel);
  bluePage.append(redComposite, greenComposite, blueLabel);

  bluePage.on("touchstart", function(event) {
    printXY(blueLabel, "touchstart", event);
    bluePage.set("background", colors.blue[1]);
  }).on("touchmove", function(event) {
    printXY(blueLabel, "touchmove", event);
  }).on("touchend", function(event) {
    printXY(blueLabel, "touchend", event);
    bluePage.set("background", colors.blue[0]);
  }).on("touchcancel", function(event) {
    printXY(blueLabel, "touchcancel", event);
    bluePage.set("background", colors.blue[0]);
  }).on("longpress", function(event) {
    bluePage.set("background", "white");
    printXY(blueLabel, "longpress", event);
  });

  redComposite.on("touchstart", function(event) {
    printXY(redLabel, "touchstart", event);
    redComposite.set("background", colors.red[1]);
  }).on("touchmove", function(event) {
    printXY(redLabel, "touchmove", event);
  }).on("touchend", function(event) {
    printXY(redLabel, "touchend", event);
    redComposite.set("background", colors.red[0]);
  }).on("touchcancel", function(event) {
    printXY(redLabel, "touchcancel", event);
    redComposite.set("background", colors.red[0]);
  }).on("longpress", function(event) {
    redComposite.set("background", "white");
    printXY(redLabel, "longpress", event);
  });

  greenLabel.set("text", "No touch here!");

  bluePage.open();

});
