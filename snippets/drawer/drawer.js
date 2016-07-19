var page = new tabris.Page({
  title: "Drawer",
  topLevel: true
});

var drawer = new tabris.Drawer()
  .on("open", function() {
    console.log("drawer opened");
  })
  .on("close", function() {
    console.log("drawer closed");
  });

var arrow = String.fromCharCode(8592);
createLabel(arrow + " Swipe from left or tap here").on("tap", function() {
  drawer.open();
}).appendTo(page);

createLabel("Thank you!").on("tap", function() {
  drawer.close();
}).appendTo(drawer);

page.open();

function createLabel(text) {
  return new tabris.TextView({
    layoutData: {left: 10, centerY: 0},
    text: text,
    font: "22px Arial"
  });
}
