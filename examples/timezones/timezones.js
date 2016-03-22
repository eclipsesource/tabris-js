var moment = require("moment-timezone");

var page = new tabris.Page({
  title: "Timezones",
  topLevel: true
});

createTextView("Europe/Berlin", "Berlin");
createTextView("America/New_York", "New York");
createTextView("Asia/Tokyo", "Tokyo");
update();

page.open();

function createTextView(timezone, name) {
  var locationTextView = new tabris.TextView({
    layoutData: {top: "prev() 30", centerX: 0},
    text: name
  }).appendTo(page);
  new tabris.TextView({
    layoutData: {top: [locationTextView, 10], centerX: 0},
    font: "bold 50px sans-serif"
  }).on("update", function() {
    this.set("text", moment.tz(timezone).format("h:mm a"));
  }).appendTo(page);
}

function update() {
  page.children().forEach(function(widget) {
    widget.trigger("update");
  });
  var delay = 60000 - Date.now() % 60000;
  setTimeout(update, delay);
}
