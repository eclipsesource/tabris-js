var MARGIN = 16;
var MARGIN_LARGE = 32;

var scaleModes = ["auto", "fit", "fill", "stretch", "none"];

var page = tabris.create("Page", {
  title: "ImageView",
  topLevel: true
});

var imageView = tabris.create("ImageView", {
  image: getImage(0),
  background: "rgb(220, 220, 220)",
  layoutData: {top: MARGIN, width: 200, height: 200, centerX: 0}
}).appendTo(page);

tabris.create("TextView", {
  id: "imageSizeLabel",
  layoutData: {left: MARGIN, top: [imageView, MARGIN_LARGE], width: 96},
  text: "Image"
}).appendTo(page);

tabris.create("Picker", {
  layoutData: {right: MARGIN, left: ["#imageSizeLabel", 0], baseline: "#imageSizeLabel"},
  items: ["Large", "Small"]
}).on("change:selectionIndex", function(picker, index) {
  imageView.set("image", getImage(index));
}).appendTo(page);

tabris.create("TextView", {
  id: "scaleModeLabel",
  layoutData: {left: MARGIN, top: ["#imageSizeLabel", MARGIN_LARGE], width: 96},
  text: "Scale mode"
}).appendTo(page);

tabris.create("Picker", {
  layoutData: {right: MARGIN, left: ["#scaleModeLabel", 0], baseline: "#scaleModeLabel"},
  items: scaleModes
}).on("change:selectionIndex", function(picker, index) {
  imageView.set("scaleMode", scaleModes[index]);
}).appendTo(page);

function getImage(index) {
  return index === 0 ? {src: "images/salad.jpg", scale: 3} :  {src: "images/landscape.jpg", scale: 3};
}

page.open();
