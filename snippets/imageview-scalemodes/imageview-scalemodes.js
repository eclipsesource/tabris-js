tabris.load(function() {

  var MARGIN = 16;
  var MARGIN_LARGE = 32;

  var scaleModes = ["auto", "fit", "fill", "stretch", "none"];

  var page = tabris.create("Page", {
    title: "Using different image view scale modes",
    topLevel: true
  });

  var imageView = tabris.create("ImageView", {
    image: getImage(0),
    background: "rgb(220, 220, 220)",
    layoutData: {top: MARGIN, width: 200, height: 200, centerX: 0}
  }).appendTo(page);

  var imageSizeLabel = tabris.create("Label", {
    layoutData: {left: MARGIN, top: [imageView, MARGIN_LARGE], width: 96},
    text: "Image"
  }).appendTo(page);

  var imageSizeCombo = tabris.create("Combo", {
    layoutData: {right: MARGIN, left: [imageSizeLabel, 0], baseline: imageSizeLabel},
    items: ["Large", "Small"],
    selectionIndex: 0
  }).appendTo(page);

  var scaleModeLabel = tabris.create("Label", {
    layoutData: {left: MARGIN, top: [imageSizeLabel, MARGIN_LARGE], width: 96},
    text: "Scale mode"
  }).appendTo(page);

  var scaleModeCombo = tabris.create("Combo", {
    layoutData: {right: MARGIN, left: [scaleModeLabel, 0], baseline: scaleModeLabel},
    items: scaleModes,
    selectionIndex: 0
  }).appendTo(page);

  imageSizeCombo.on("change:selection", function() {
    var index = imageSizeCombo.get("selectionIndex");
    imageView.set("image", getImage(index));
  });

  scaleModeCombo.on("change:selection", function() {
    var index = scaleModeCombo.get("selectionIndex");
    imageView.set("scaleMode", scaleModes[index]);
  });

  function getImage(index) {
    if (index === 0) {
      return {src: "images/salad.jpg", scale: 3};
    }
    return {src: "images/landscape.jpg", scale: 3};
  }

  page.open();

});
