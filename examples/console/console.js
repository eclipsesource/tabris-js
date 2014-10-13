tabris.load(function() {

  var MARGIN = 8;
  var MARGIN_LARGE = 16;

  var page = tabris.create("Page", {
    title: "Console",
    topLevel: true
  });

  var levelCombo = tabris.create("Combo", {
    layoutData: {right: MARGIN, top: MARGIN_LARGE},
    items: ["Error", "Warning", "Info", "Log", "Debug"],
    selectionIndex: 2
  });

  var logText = tabris.create("Text", {
    text: "Message",
    message: "Log message",
    layoutData: {left: MARGIN, top: MARGIN_LARGE, right: [levelCombo, MARGIN]}
  });

  var logButton = tabris.create("Button", {
    text: "Log",
    layoutData: {left: MARGIN, right: MARGIN, top: [levelCombo, MARGIN_LARGE]}
  });

  page.append(levelCombo, logText, logButton);

  logButton.on("Selection", function() {
    var text = logText.get("text");
    var selection = levelCombo.get("selectionIndex");
    if (selection === 0) {
      console.error(text);
    } else if (selection === 1) {
      console.warn(text);
    } else if (selection === 2) {
      console.info(text);
    } else if (selection === 3) {
      console.log(text);
    } else if (selection === 4) {
      console.debug(text);
    }
  });

  var undefinedVar;
  var nullVar = null;
  var func = function() {
    console.log("hallo");
  };

  console.error("Error string", "This is not an error");
  console.warn("Warn array", ["a", 1, false]);
  console.info(func);
  console.log("Log date", new Date());
  console.log("Log object", logButton);
  console.debug("Debug undefined", undefinedVar);
  console.debug("Debug null", nullVar);

  page.open();

});
