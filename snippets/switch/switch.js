var MARGIN = 16;

new tabris.Switch({
  id: "switch",
  selection: true,
  layoutData: {left: MARGIN, top: MARGIN}
}).on("change:selection", function(widget, selection) {
  tabris.ui.contentView.find("#stateView").set("text", selection ? "State: checked" : "State: unchecked");
}).appendTo(tabris.ui.contentView);

new tabris.TextView({
  id: "stateView",
  text: "State: checked",
  layoutData: {left: ["#switch", MARGIN], baseline: "#switch"}
}).appendTo(tabris.ui.contentView);

new tabris.Button({
  text: "Toggle Switch",
  layoutData: {left: MARGIN, top: ["#switch", MARGIN]}
}).on("select", function() {
  var checked = tabris.ui.contentView.find("#switch").first().selection;
  tabris.ui.contentView.find("#switch").set("selection", !checked);
}).appendTo(tabris.ui.contentView);
