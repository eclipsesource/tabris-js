tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Image View - Scale mode 'auto'",
    topLevel: true
  });

  var imageView = tabris.create("ImageView", {
    layoutData: {left: 20, top: 20, width: 100, height: 250},
    image: {src: "images/target_200.png"},
    background: "#aaaaaa",
    scaleMode: "auto"
  }).appendTo(page);

  tabris.create("Slider", {
    layoutData: {left: 20, top: [imageView, 20], right: 100},
    minimum: 50,
    selection: 100,
    maximum: 300
  }).on("change:selection", function() {
    imageView.set("layoutData", {left: 20, top: 20, width: this.get("selection"), height: 250});
  }).appendTo(page);

  page.open();

});
