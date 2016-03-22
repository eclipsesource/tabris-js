var page = new tabris.Page({
  title: "Elevation (Android 5.0+ only)",
  topLevel: true,
  background: "#e0e0e0"
});

new tabris.Composite({
  layoutData: {top: 64, width: 200, height: 200, centerX: 0},
  elevation: 8,
  background: "white"
}).appendTo(page);

page.open();
