var moment = require("moment-timezone");

var page = tabris.create("Page", {
  title: "Timezones",
  topLevel: true
});

page.open();

createTextView("Europe/Berlin", "Berlin");
createTextView("America/New_York", "New York");
createTextView("Asia/Tokyo", "Tokyo");

update();

function createTextView(timezone, name) {
  var locationTextView = tabris.create("TextView", {
    layoutData: {top: [page.children().last() || 0, 30], centerX: 0},
    text: name
  }).appendTo(page);
  tabris.create("TextView", {
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
