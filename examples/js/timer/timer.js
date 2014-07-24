tabris.load(function() {

  var MARGIN = 12;
  var MARGIN_LARGE = 24;
  var LARGE_FONT = [[""], 20, false, false];

  var cpsCount = 0;
  var startTime = new Date().getTime();

  var taskId;

  var page = tabris.createPage({
    title: "Timer",
    topLevel: true
  });

  var labelStatus = page.append("rwt.widgets.Label", {
    text: "Last update: <none>",
    layoutData: {left: MARGIN, top: MARGIN_LARGE, right: MARGIN},
    font: LARGE_FONT
  });

  var labelCps = page.append("rwt.widgets.Label", {
    text: "Calls per second: <none>",
    layoutData: {left: MARGIN, top: [labelStatus, MARGIN], right: MARGIN},
    font: LARGE_FONT
  });

  var labelDelay = page.append("rwt.widgets.Label", {
    text: "Delay (ms)",
    layoutData: {left: MARGIN, top: [labelCps, MARGIN_LARGE]}
  });

  var textDelay = page.append("Text", {
    text: "1000",
    message: "Delay (ms)",
    layoutData: {left: [labelDelay, MARGIN], top: [labelCps, MARGIN_LARGE]}
  });

  var checkRepeat = page.append("CheckBox", {
    text: "Repeat",
    layoutData: {left: MARGIN, top: [textDelay, MARGIN]}
  });

  var buttonStart = page.append("Button", {
    text: "Start timer",
    layoutData: {left: [50, MARGIN / 4], top: [checkRepeat, MARGIN_LARGE], right: MARGIN}
  });

  var buttonCancelTimer = page.append("Button", {
    text: "Cancel timer",
    layoutData: {left: MARGIN, top: [checkRepeat, MARGIN_LARGE], right: [50, MARGIN / 4]}
  });

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

  buttonStart.on("Selection", function() {
    var delay = parseInt(textDelay.get("text"));
    if (checkRepeat.get("selection")) {
      taskId = window.setInterval(updateStatusLabels, delay);
    } else {
      taskId = window.setTimeout(function() {
        updateStatusLabels();
        enableTimerStart(true);
      }, delay);
    }
    enableTimerStart(false);
  });

  buttonCancelTimer.on("Selection", function() {
    window.clearTimeout(taskId);
    enableTimerStart(true);
  });

  enableTimerStart(true);

  page.open();

});