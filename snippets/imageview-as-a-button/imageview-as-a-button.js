var page = new tabris.Page({
  title: "Using an image view as a button",
  topLevel: true
});

var touched = 0;
new tabris.ImageView({
  layoutData: {centerX: 0, centerY: 0},
  image: {src: "images/target_200.png"},
  highlightOnTouch: true
}).on("tap", function() {
  touched++;
  page.set("title", "touched " + touched + " times");
}).appendTo(page);

page.open();
