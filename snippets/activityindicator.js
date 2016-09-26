// Create the activity indicator centered in the page
var activityIndicator = new tabris.ActivityIndicator({
  centerX: 0,
  centerY: 0
}).appendTo(tabris.ui.contentView);

// Create reload button
var reloadButton = new tabris.Button({
  layoutData: {centerX: 0, centerY: 0},
  text: "Run Task"
}).on("select", function() {
  executeLongRunningTask();
}).appendTo(tabris.ui.contentView);

function executeLongRunningTask() {
  // Toggle visibiliy of elements
  activityIndicator.set("visible", true);
  reloadButton.set("visible", false);

  setTimeout(function() {
    // Async action is done
    activityIndicator.set("visible", false);
    reloadButton.set("visible", true);
  }, 2500);
}

executeLongRunningTask();
