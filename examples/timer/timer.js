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

  var labelStatus = tabris.create("Label", {
    text: "Last update: <none>",
    layoutData: {left: MARGIN, top: MARGIN_LARGE, right: MARGIN},
    font: LARGE_FONT
  });

  var labelCps = tabris.create("Label", {
    text: "Calls per second: <none>",
    layoutData: {left: MARGIN, top: [labelStatus, MARGIN], right: MARGIN},
    font: LARGE_FONT
  });

  var labelDelay = tabris.create("Label", {
    text: "Delay (ms)",
    layoutData: {left: MARGIN, top: [labelCps, MARGIN_LARGE]}
  });

  var textDelay = tabris.create("Text", {
    text: "1000",
    message: "Delay (ms)",
    layoutData: {left: [labelDelay, MARGIN], top: [labelCps, MARGIN_LARGE]}
  });

  var checkRepeat = tabris.create("CheckBox", {
    text: "Repeat",
    layoutData: {left: MARGIN, top: [textDelay, MARGIN]}
  });

  var buttonStart = tabris.create("Button", {
    text: "Start timer",
    layoutData: {left: [50, MARGIN / 4], top: [checkRepeat, MARGIN_LARGE], right: MARGIN}
  });

  var buttonCancelTimer = tabris.create("Button", {
    text: "Cancel timer",
    layoutData: {left: MARGIN, top: [checkRepeat, MARGIN_LARGE], right: [50, MARGIN / 4]}
  });

  page.append(labelStatus, labelCps, labelDelay, textDelay, checkRepeat, buttonStart, buttonCancelTimer);

  var updateStatusLabels = function() {
    cpsCount++;
    var curTime = new Date().getTime();
    var diff = curTime - startTime;
    if (diff >= 1000) {
      labelCps.set("text", "Calls per second: " + cpsCount);
      cpsCount = 0;
      startTime = curTime;
    }
    labelStatus.set("text", "Last update: " + new Date().getTime().toString());
  };

  function enableTimerStart(available) {
    buttonStart.set("enabled", available);
    buttonCancelTimer.set("enabled", !available);
  }

  buttonStart.on("selection", function() {
    var delay = parseInt(textDelay.get("text"));
    if (checkRepeat.get("selection")) {
      taskId = setInterval(updateStatusLabels, delay);
    } else {
      taskId = setTimeout(function() {
        updateStatusLabels();
        enableTimerStart(true);
      }, delay);
    }
    enableTimerStart(false);
  });

  buttonCancelTimer.on("selection", function() {
    clearTimeout(taskId);
    enableTimerStart(true);
  });

  enableTimerStart(true);

  page.open();

});
