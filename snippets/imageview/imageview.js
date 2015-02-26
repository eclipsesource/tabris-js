var page = tabris.create("Page", {
  title: "Image View",
  topLevel: true
});

var createImageView = function(scaleMode) {
  tabris.create("ImageView", {
    layoutData: {left: 10, top: [page.children().last() || "0%", 10], width: 250, height: 100},
    image: {src: "images/target_200.png"},
    background: "#aaaaaa",
    scaleMode: scaleMode
  }).appendTo(page);
};

createImageView("fit");
createImageView("none");
createImageView("fill");

page.open();
