var page = new tabris.Page({
  title: "Fullscreen options",
  topLevel: true
}).open();

new tabris.CheckBox({
  left: 16, top: 16,
  text: "Fullscreen"
}).on("select", function(checkbox, checked) {
  tabris.ui.set("displayMode", checked ? "fullscreen" : "normal");
}).appendTo(page);

new tabris.CheckBox({
  left: 16, top: "prev() 12",
  text: "Toolbar visible",
  selection: true
}).on("select", function(checkbox, checked) {
  tabris.ui.set("toolbarVisible", checked);
}).appendTo(page);
