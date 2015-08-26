var page = tabris.create("Page", {
  title: "Toggling UI toolbar visibility",
  topLevel: true
}).open();

tabris.create("ToggleButton", {
  layoutData: {centerX: 0, centerY: 0},
  text: "Toolbar visible",
  selection: true
}).on("select", function(toggleButton, selection) {
  tabris.ui.set("toolbarVisible", selection);
  toggleButton.set("text", "Toolbar " + (selection ? "visible" : "invisible"));
}).appendTo(page);
