var page = tabris.create("Page", {
  title: "Using an image view as a button",
  topLevel: true
});

var touched = 0;
tabris.create("ImageView", {
  layoutData: {centerX: 0, centerY: 0},
  image: {src: "images/target_200.png"},
  highlightOnTouch: true
}).on("touchend", function() {
  touched++;
  page.set("title", "touched " + touched + " times");
}).appendTo(page);

page.open();
