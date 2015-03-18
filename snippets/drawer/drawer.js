var page = tabris.create("Page", {
  title: "Drawer",
  topLevel: true
});

var drawer = tabris.create("Drawer");

var arrow = String.fromCharCode(8592);
createLabel(arrow + " Swipe from left or tap here").on("tap", function() {
  drawer.open();
}).appendTo(page);

createLabel("Thank you!").on("tap", function() {
  drawer.close();
}).appendTo(drawer);

page.open();

function createLabel(text) {
  return tabris.create("TextView", {
    layoutData: {left: 10, centerY: 0},
    text: text,
    font: "22px Arial"
  });
}
