var MARGIN = 16;
var MARGIN_LARGE = 24;

var cpsCount = 0;
var startTime = new Date().getTime();
var taskId;

var statusTextView = new tabris.TextView({
  left: MARGIN, top: MARGIN_LARGE, right: MARGIN,
  text: 'Last update: <none>'
}).appendTo(tabris.ui.contentView);

var cpsTextView = new tabris.TextView({
  left: MARGIN, top: [statusTextView, MARGIN], right: MARGIN,
  text: 'Calls per second: <none>'
}).appendTo(tabris.ui.contentView);

var delayTextView = new tabris.TextView({
  left: MARGIN, baseline: '#delayTextInput',
  text: 'Delay (ms):'
}).appendTo(tabris.ui.contentView);

var delayTextInput = new tabris.TextInput({
  left: [delayTextView, MARGIN], top: [cpsTextView, MARGIN_LARGE],
  id: 'delayTextInput',
  text: '1000',
  message: 'Delay (ms)'
}).appendTo(tabris.ui.contentView);

var repeatCheckbox = new tabris.CheckBox({
  left: MARGIN, top: delayTextInput,
  text: 'Repeat'
}).appendTo(tabris.ui.contentView);

var startButton = new tabris.Button({
  left: ['50%', MARGIN / 4], top: [repeatCheckbox, MARGIN_LARGE], right: MARGIN,
  text: 'Start timer'
}).on('select', function() {
  var delay = parseInt(delayTextInput.text);
  if (repeatCheckbox.selection) {
    taskId = setInterval(updateStatusTextViews, delay);
  } else {
    taskId = setTimeout(function() {
      updateStatusTextViews();
      enableTimerStart(true);
    }, delay);
  }
  enableTimerStart(false);
}).appendTo(tabris.ui.contentView);

var cancelButton = new tabris.Button({
  left: MARGIN, top: [repeatCheckbox, MARGIN_LARGE], right: ['50%', MARGIN / 4],
  text: 'Cancel timer',
  enabled: false
}).on('select', function() {
  clearTimeout(taskId);
  enableTimerStart(true);
}).appendTo(tabris.ui.contentView);

function updateStatusTextViews() {
  cpsCount++;
  var curTime = new Date().getTime();
  var diff = curTime - startTime;
  if (diff >= 1000) {
    cpsTextView.text = 'Calls per second: ' + cpsCount;
    cpsCount = 0;
    startTime = curTime;
  }
  statusTextView.text = 'Last update: ' + new Date().getTime().toString();
}

function enableTimerStart(available) {
  startButton.enabled = available;
  cancelButton.enabled = !available;
}
