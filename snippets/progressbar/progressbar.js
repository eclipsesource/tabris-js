var page = tabris.create("Page", {
  title: "ProgressBar",
  topLevel: true
});

var progressBar = tabris.create("ProgressBar", {
  layoutData: {left: 15, right: 15, centerY: 0},
  maximum: 300,
  selection: 100
}).appendTo(page);

setInterval(function() {
  var selection = progressBar.get("selection") + 1;
  progressBar.set("selection", selection > 300 ? 0 : selection);
}, 20);

page.open();
