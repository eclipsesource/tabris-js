var MARGIN = 16;

var page = new tabris.Page({
  title: "Switch",
  topLevel: true
});

new tabris.Switch({
  id: "switch",
  selection: true,
  layoutData: {left: MARGIN, top: MARGIN}
}).on("change:selection", function(widget, selection) {
  page.find("#stateView").set("text", selection ? "State: checked" : "State: unchecked");
}).appendTo(page);

new tabris.TextView({
  id: "stateView",
  text: "State: checked",
  layoutData: {left: ["#switch", MARGIN], baseline: "#switch"}
}).appendTo(page);

new tabris.Button({
  text: "Toggle Switch",
  layoutData: {left: MARGIN, top: ["#switch", MARGIN]}
}).on("select", function() {
  var checked = page.find("#switch").get("selection");
  page.find("#switch").set("selection", !checked);
}).appendTo(page);

page.open();
