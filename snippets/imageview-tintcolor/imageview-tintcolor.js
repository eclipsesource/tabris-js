var page = tabris.create("Page", {
  title: "ImageView tintColor",
  topLevel: true
});

var colors = ["initial", "red", "green", "blue"];

var imageView = tabris.create("ImageView", {
  top: 64, centerX: 0,
  image: {src: "images/cloud-check.png", scale: 3}
}).appendTo(page);

tabris.create("Picker", {
  top: [imageView, 16], centerX: 0,
  items: colors
}).on("change:selection", function(picker, color) {
  imageView.set("tintColor", color);
}).appendTo(page);

page.open();
