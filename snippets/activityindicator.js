import {ActivityIndicator, Button, ui} from 'tabris';

// Create the activity indicator centered in the page
const activityIndicator = new ActivityIndicator({
  centerX: 0,
  centerY: 0
}).appendTo(ui.contentView);

// Create reload button
const reloadButton = new Button({
  centerX: 0, centerY: 0,
  text: 'Run Task'
}).on('select', () => executeLongRunningTask())
  .appendTo(ui.contentView);

function executeLongRunningTask() {
  // Toggle visibility of elements
  activityIndicator.visible = true;
  reloadButton.visible = false;

  setTimeout(() => {
    // Async action is done
    activityIndicator.visible = false;
    reloadButton.visible = true;
  }, 2500);
}

executeLongRunningTask();
