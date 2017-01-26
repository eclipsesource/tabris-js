var moment = require('moment-timezone');

createTextView('Europe/Berlin', 'Berlin');
createTextView('America/New_York', 'New York');
createTextView('Asia/Tokyo', 'Tokyo');
update();

function createTextView(timezone, name) {
  var locationTextView = new tabris.TextView({
    top: 'prev() 30', centerX: 0,
    text: name
  }).appendTo(tabris.ui.contentView);
  new tabris.TextView({
    top: [locationTextView, 10], centerX: 0,
    font: 'bold 50px sans-serif',
    text: 'foo'
  }).on('update', function() {
    this.text = moment.tz(timezone).format('h:mm a');
  }).appendTo(tabris.ui.contentView);
}

function update() {
  tabris.ui.contentView.children().forEach(function(widget) {
    console.error('update on ' + widget);
    widget.trigger('update');
  });
  var delay = 60000 - Date.now() % 60000;
  setTimeout(update, delay);
}
