var textView = new tabris.TextView({
  layoutData: {left: 10, right: 10, top: "30%"},
  alignment: "center",
  font: "22px sans-serif",
  text: "50"
}).appendTo(tabris.ui.contentView);

new tabris.Slider({
  layoutData: {left: 50, top: [textView, 20], right: 50},
  minimum: -50,
  selection: 50,
  maximum: 150
}).on("change:selection", function(slider, selection) {
  textView.set("text", selection);
}).appendTo(tabris.ui.contentView);
