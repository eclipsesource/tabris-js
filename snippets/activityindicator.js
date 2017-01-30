// Create the activity indicator centered in the page
var activityIndicator = new tabris.ActivityIndicator({
  centerX: 0,
  centerY: 0
}).appendTo(tabris.ui.contentView);

// Create reload button
var reloadButton = new tabris.Button({
  centerX: 0, centerY: 0,
  text: 'Run Task'
}).on('select', function() {
  executeLongRunningTask();
}).appendTo(tabris.ui.contentView);

function executeLongRunningTask() {
  // Toggle visibility of elements
  activityIndicator.visible = true;
  reloadButton.visible = false;

  setTimeout(function() {
    // Async action is done
    activityIndicator.visible = false;
    reloadButton.visible = true;
  }, 2500);
}

executeLongRunningTask();
