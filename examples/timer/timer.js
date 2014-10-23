tabris.load(function() {

  var MARGIN = 12;
  var MARGIN_LARGE = 24;
  var LARGE_FONT = "20px";

  var cpsCount = 0;
  var startTime = new Date().getTime();
  var taskId;

  var page = tabris.create("Page", {
    title: "Timer",
    topLevel: true
  });

  var statusLabel = tabris.create("Label", {
    text: "Last update: <none>",
    layoutData: {left: MARGIN, top: MARGIN_LARGE, right: MARGIN},
    font: LARGE_FONT
  }).appendTo(page);

  var cpsLabel = tabris.create("Label", {
    text: "Calls per second: <none>",
    layoutData: {left: MARGIN, top: [statusLabel, MARGIN], right: MARGIN},
    font: LARGE_FONT
  }).appendTo(page);

  var delayLabel = tabris.create("Label", {
    text: "Delay (ms)",
    layoutData: {left: MARGIN, top: [cpsLabel, MARGIN_LARGE]}
  }).appendTo(page);

  var delayText = tabris.create("Text", {
    text: "1000",
    message: "Delay (ms)",
    layoutData: {left: [delayLabel, MARGIN], top: [cpsLabel, MARGIN_LARGE]}
  }).appendTo(page);

  var repeatCheckbox = tabris.create("CheckBox", {
    text: "Repeat",
    layoutData: {left: MARGIN, top: [delayText, MARGIN]}
  }).appendTo(page);

  var startButton = tabris.create("Button", {
    text: "Start timer",
    layoutData: {left: [50, MARGIN / 4], top: [repeatCheckbox, MARGIN_LARGE], right: MARGIN}
  }).on("selection", function() {
    var delay = parseInt(delayText.get("text"));
    if (repeatCheckbox.get("selection")) {
      taskId = setInterval(updateStatusLabels, delay);
    } else {
      taskId = setTimeout(function() {
        updateStatusLabels();
        enableTimerStart(true);
      }, delay);
    }
    enableTimerStart(false);
  }).appendTo(page);

  var cancelButton = tabris.create("Button", {
    text: "Cancel timer",
    layoutData: {left: MARGIN, top: [repeatCheckbox, MARGIN_LARGE], right: [50, MARGIN / 4]}
  }).on("selection", function() {
    clearTimeout(taskId);
    enableTimerStart(true);
  }).appendTo(page);

  enableTimerStart(true);

  page.open();

  function updateStatusLabels() {
    cpsCount++;
    var curTime = new Date().getTime();
    var diff = curTime - startTime;
    if (diff >= 1000) {
      cpsLabel.set("text", "Calls per second: " + cpsCount);
      cpsCount = 0;
      startTime = curTime;
    }
    statusLabel.set("text", "Last update: " + new Date().getTime().toString());
  }

  function enableTimerStart(available) {
    startButton.set("enabled", available);
    cancelButton.set("enabled", !available);
  }

});
