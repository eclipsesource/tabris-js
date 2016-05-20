var page = new tabris.Page({
  title: "ImageView tintColor",
  topLevel: true
});

var colors = ["initial", "red", "green", "blue"];

var imageView = new tabris.ImageView({
  top: 64, centerX: 0,
  image: {src: "images/cloud-check.png", scale: 3}
}).appendTo(page);

new tabris.Picker({
  top: [imageView, 16], centerX: 0,
  items: colors
}).on("change:selection", function(picker, color) {
  imageView.set("tintColor", color);
}).appendTo(page);

page.open();
