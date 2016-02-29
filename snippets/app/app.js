var page = new tabris.Page({
  title: "App Info",
  topLevel: true
});

var paused = 0;

var label = new tabris.TextView({
  layoutData: {left: 25, right: 25, centerY: 0},
  font: "32px sans-serif",
  alignment: "center",
  text: "Pause and resume this app!"
}).appendTo(page);

new tabris.Button({
  layoutData: {centerX: 0, bottom: 32},
  text: "Reload"
}).on("select", function() {
  tabris.app.reload();
}).appendTo(page);

tabris.app.on("pause", function() {
  paused = Date.now();
}).on("resume", function() {
  var diff = Date.now() - paused;
  label.set("text", " Welcome back!\n You were gone for " + (diff / 1000).toFixed(1) + " seconds.");
});

tabris.app.on("backnavigation", function(app, options) {
  options.preventDefault = true;
  label.set("text", "Back navigation prevented.");
});

page.open();
