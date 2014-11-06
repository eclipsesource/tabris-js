// this snippet uses internal API which will become obsolete
// in the near future tabris.js will be using Cordova events
tabris.registerType("App", {
  _type: "tabris.App",
  _listen: {Pause: true, Resume: true, BackNavigation: true}
});

tabris.load(function() {

  var page = tabris.create("Page", {
    title: "App Service",
    topLevel: true
  });
  var statusLabel = tabris.create("Label", {
    layoutData: {left: 10, right: 10, centerY: 0},
    alignment: "center",
    font: "22px sans-serif",
    text: "App started"
  }).appendTo(page);

  tabris("App").on("Pause", function() {
    statusLabel.set("text", "App paused");
  }).on("Resume", function() {
    statusLabel.set("text", "App resumed");
  }).on("BackNavigation", function() {
    statusLabel.set("text", "Back navigation consumed");
  });

  page.open();

});
