var page = new tabris.Page({
  title: "Status Bar Theme",
  topLevel: true
}).open();

var themes = ["default", "light", "dark"];

new tabris.Picker({
  layoutData: {left: 16, top: 16, right: 16},
  items: themes
}).on("change:selection", function(picker, theme) {
  tabris.ui.set("statusBarTheme", theme);
}).appendTo(page);
