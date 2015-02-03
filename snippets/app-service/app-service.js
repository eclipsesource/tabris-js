// this snippet uses internal API which will become obsolete
// in the near future tabris.js will be using Cordova events
tabris.registerType("App", {
  _type: "tabris.App",
  _listen: {Pause: true, Resume: true, BackNavigation: true}
});

var page = tabris.create("Page", {
  title: "App Service",
  topLevel: true
});

var statusTextView = tabris.create("TextView", {
  layoutData: {left: 10, right: 10, centerY: 0},
  alignment: "center",
  font: "22px sans-serif",
  text: "App started"
}).appendTo(page);

tabris("App").on("Pause", function() {
  statusTextView.set("text", "App paused");
}).on("Resume", function() {
  statusTextView.set("text", "App resumed");
}).on("BackNavigation", function() {
  statusTextView.set("text", "Back navigation consumed");
});

page.open();
