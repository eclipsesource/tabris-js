var page = tabris.create("Page", {
  title: "Slider",
  topLevel: true
});

var textView = tabris.create("TextView", {
  layoutData: {left: 10, right: 10, top: [30, 0]},
  alignment: "center",
  font: "22px sans-serif",
  text: "50"
}).appendTo(page);

tabris.create("Slider", {
  layoutData: {left: 50, top: [textView, 20], right: 50},
  minimum: -50,
  selection: 50,
  maximum: 150
}).on("change:selection", function() {
  textView.set("text", this.get("selection").toString());
}).appendTo(page);

page.open();
