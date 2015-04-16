var RowLayout = require("./RowLayout");

var page = tabris.create("Page", {
  title: "Column Layout",
  topLevel: true
});

var composite = tabris.create("Composite", {
  layoutData: {left: 0, top: 0, right: 0, bottom: 0}
}).appendTo(page);

var count = 1;
tabris.create("Button", {
  text: "Add Button"
}).on("select", function() {
  return tabris.create("Button", {
    text: "Button " + count++ + " (remove)"
  }).on("select", function() {
    this.dispose();
  }).appendTo(composite);
}).appendTo(composite);

new RowLayout({margin: 20, spacing: 10}).attachTo(composite).layout();

page.open();
