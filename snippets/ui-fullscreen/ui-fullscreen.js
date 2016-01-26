var page = tabris.create("Page", {
  title: "Fullscreen options",
  topLevel: true
}).open();

tabris.create("CheckBox", {
  left: 16, top: 16,
  text: "Fullscreen"
}).on("select", function(checkbox, checked) {
  tabris.ui.set("displayMode", checked ? "fullscreen" : "normal");
}).appendTo(page);

tabris.create("CheckBox", {
  left: 16, top: "prev() 12",
  text: "Toolbar visible",
  selection: true
}).on("select", function(checkbox, checked) {
  tabris.ui.set("toolbarVisible", checked);
}).appendTo(page);
