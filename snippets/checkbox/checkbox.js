var page = tabris.create("Page", {
  title: "Check Boxes",
  topLevel: true
});

tabris.create("CheckBox", {
  layoutData: {left: 10, top: 10},
  selection: true,
  text: "selected"
}).on("change:selection", function() {
  this.set("text", this.get("selection") ? "selected" : "deselected");
}).appendTo(page);

page.open();
