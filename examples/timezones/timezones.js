var moment = require("moment-timezone");

var page = tabris.create("Page", {
  title: "Timezones",
  topLevel: true
});

page.open();

createLabel("Europe/Berlin", "Berlin");
createLabel("America/New_York", "New York");
createLabel("Asia/Tokyo", "Tokyo");

update();

function createLabel(timezone, name) {
  var locationLabel = tabris.create("Label", {
    layoutData: {top: [page.children().last() || 0, 30], centerX: 0},
    text: name
  }).appendTo(page);
  tabris.create("Label", {
    layoutData: {top: [locationLabel, 10], centerX: 0},
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
