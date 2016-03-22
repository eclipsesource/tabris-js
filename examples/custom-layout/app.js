var RowLayout = require("./RowLayout");

var page = new tabris.Page({
  title: "Column Layout",
  topLevel: true
});

var composite = new tabris.Composite({
  layoutData: {left: 0, top: 0, right: 0, bottom: 0}
}).appendTo(page);

var count = 1;
new tabris.Button({
  text: "Add Button"
}).on("select", function() {
  return new tabris.Button({
    text: "Button " + count++ + " (remove)"
  }).on("select", function() {
    this.dispose();
  }).appendTo(composite);
}).appendTo(composite);

new RowLayout({margin: 20, spacing: 10}).attachTo(composite).layout();

page.open();
