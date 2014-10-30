tabris.load(function() {

  var MARGIN = 8;
  var MARGIN_LARGE = 16;

  var lastWidget;
  var logText;

  var page = tabris.create("Page", {
    title: "Using the console",
    topLevel: true
  });

  var consoleFunctions = {
    error: console.error,
    warn: console.warn,
    info: console.info,
    log: console.log,
    debug: console.debug
  };

  logText = lastWidget = tabris.create("Text", {
    text: "Message",
    message: "Log message",
    layoutData: {left: MARGIN, top: MARGIN_LARGE, right: MARGIN}
  }).appendTo(page);

  var toUpperCase = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  var getConsoleHandler = function(type) {
    return function() {
      consoleFunctions[type](logText.get("text"));
    };
  };

  for (var type in consoleFunctions) {
    lastWidget = tabris.create("Button", {
      text: toUpperCase(type),
      layoutData: {left: MARGIN, right: MARGIN, top: [lastWidget, MARGIN_LARGE]}
    }).on("selection", getConsoleHandler(type)).appendTo(page);
  }

  page.open();

});
