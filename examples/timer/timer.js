const {Button, CheckBox,TextInput, TextView, ui} = require('tabris');

let cpsCount = 0;
let startTime = new Date().getTime();
let taskId;

let statusTextView = new TextView({
  left: 16, top: 24, right: 16,
  text: 'Last update: <none>'
}).appendTo(ui.contentView);

let cpsTextView = new TextView({
  left: 16, top: [statusTextView, 16], right: 16,
  text: 'Calls per second: <none>'
}).appendTo(ui.contentView);

let delayTextView = new TextView({
  left: 16, top: [cpsTextView, 24],
  text: 'Delay (ms):'
}).appendTo(ui.contentView);

let delayTextInput = new TextInput({
  left: [delayTextView, 16], baseline: delayTextView,
  id: 'delayTextInput',
  text: '1000',
  message: 'Delay (ms)'
}).appendTo(ui.contentView);

let repeatCheckbox = new CheckBox({
  left: 16, top: delayTextInput,
  text: 'Repeat'
}).appendTo(ui.contentView);

let startButton = new Button({
  left: ['50%', 16 / 4], top: [repeatCheckbox, 24], right: 16,
  text: 'Start timer'
}).on('select', () => {
  let delay = parseInt(delayTextInput.text);
  if (repeatCheckbox.checked) {
    taskId = setInterval(updateStatusTextViews, delay);
  } else {
    taskId = setTimeout(() => {
      updateStatusTextViews();
      enableTimerStart(true);
    }, delay);
  }
  enableTimerStart(false);
}).appendTo(ui.contentView);

let cancelButton = new Button({
  left: 16, top: [repeatCheckbox, 24], right: ['50%', 16 / 4],
  text: 'Cancel timer',
  enabled: false
}).on('select', () => {
  clearTimeout(taskId);
  enableTimerStart(true);
}).appendTo(ui.contentView);

function updateStatusTextViews() {
  cpsCount++;
  let curTime = new Date().getTime();
  let diff = curTime - startTime;
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
