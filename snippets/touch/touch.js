tabris.load(function() {

  var colors = {
    blue: ["#4444FF", "#AAAAFF"],
    red: ["#EE3333", "#FFAAAA"],
    green: ["#33EE33", "#AAFFAA"]
  };

  var printXY = function(label, prefix, event) {
    label.set("text", prefix + ": " + event.touches[0].x + " X " + event.touches[0].y);
  };

  var addTouchBackgroundHandlers = function(target, printComposite, targetBackground) {
    target.on("touchstart", function(event) {
      printXY(printComposite, "touchstart", event);
      target.set("background", colors[targetBackground][1]);
    }).on("touchmove", function(event) {
      printXY(printComposite, "touchmove", event);
    }).on("touchend", function(event) {
      printXY(printComposite, "touchend", event);
      target.set("background", colors[targetBackground][0]);
    }).on("touchcancel", function(event) {
      printXY(printComposite, "touchcancel", event);
      target.set("background", colors[targetBackground][0]);
    }).on("longpress", function(event) {
      target.set("background", "white");
      printXY(printComposite, "longpress"  , event);
    });
  };

  var bluePage = tabris.create("Page", {
    title: "Handle touch event data",
    topLevel: true,
    background: colors.blue[0]
  });

  var redComposite = tabris.create("Composite", {
    layoutData: {left: 30, right: 30, top: 60, bottom: [50, 0]},
    background: colors.red[0]
  }).appendTo(bluePage);

  var greenComposite = tabris.create("Composite", {
    layoutData: {left: 30, right: 30, top: [50, 30], bottom: 30},
    background: colors.green[0]
  }).appendTo(bluePage);

  var blueLabel = tabris.create("Label", {
    font: "20px sans-serif"
  }).appendTo(bluePage);

  var redLabel = tabris.create("Label", {
    font: "20px sans-serif"
  }).appendTo(redComposite);

  tabris.create("Label", {
    font: "20px sans-serif",
    text: "No touch here!"
  }).appendTo(greenComposite);

  addTouchBackgroundHandlers(bluePage, blueLabel, "blue");
  addTouchBackgroundHandlers(redComposite, redLabel, "red");

  bluePage.open();

});
