var MARGIN = 16;

var page = tabris.create("Page", {
  title: "Switch",
  topLevel: true
});

tabris.create("Switch", {
  id: "switch",
  selection: true,
  layoutData: {left: MARGIN, top: MARGIN}
}).on("change:selection", function(widget, selection) {
  page.find("#stateView").set("text", selection ? "State: checked" : "State: unchecked");
}).appendTo(page);

tabris.create("TextView", {
  id: "stateView",
  text: "State: checked",
  layoutData: {left: ["#switch", MARGIN], baseline: "#switch"}
}).appendTo(page);

tabris.create("Button", {
  text: "Toggle Switch",
  layoutData: {left: MARGIN, top: ["#switch", MARGIN]}
}).on("select", function() {
  var checked = page.find("#switch").get("selection");
  page.find("#switch").set("selection", !checked);
}).appendTo(page);

page.open();
