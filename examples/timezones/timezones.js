const {TextView, ui} = require('tabris');
const moment = require('moment-timezone');

createTimeDisplay('Europe/Berlin', 'Berlin');
createTimeDisplay('America/New_York', 'New York');
createTimeDisplay('Asia/Tokyo', 'Tokyo');
update();

function createTimeDisplay(timezone, name) {
  new TextView({
    top: 'prev() 30', centerX: 0,
    text: name
  }).appendTo(ui.contentView);
  const timeLabel = new TextView({
    top: 'prev() 10', centerX: 0,
    font: 'bold 50px sans-serif'
  }).on('update', () => timeLabel.text = moment.tz(timezone).format('h:mm a'))
    .appendTo(ui.contentView);
}

function update() {
  ui.contentView.children().trigger('update');
  setTimeout(update, 60000 - Date.now() % 60000);
}
