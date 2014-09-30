tabris.load(function() {

  var MARGIN_SMALL = 4;
  var MARGIN = 8;

  var page = tabris.createPage({
    topLevel: true,
    title: "Aud'cuisine"
  });

  var scrollComposite = page.append("ScrollComposite", {
    layoutData: { left: 0, right: 0, top: 0, bottom: 0 }
  });

  var titleComposite = scrollComposite.append("Composite", {
    background: "rgba(255,152,0,0.9)"
  });

  var subtitleLabel = titleComposite.append("Label", {
    style: ["WRAP"],
    markupEnabled: true,
    text: "<b>The perfect side dish</b>",
    font: "16px",
    layoutData: { left: MARGIN, top: MARGIN, right: MARGIN},
    foreground: "black"
  });

  titleComposite.append("Label", {
    style: ["WRAP"],
    layoutData: { left: MARGIN, top: [subtitleLabel, MARGIN_SMALL], right: MARGIN},
    markupEnabled: true,
    text: "<b>INDIAN SUMMER SALAD</b>",
    font: "24px",
    foreground: "white"
  });

  var contentComposite = scrollComposite.append("Composite", {
    layoutData: { left: 0, right: 0, top: [titleComposite, 0], height: 1000 },
    background: "white"
  });

  contentComposite.append("Label", {
    style: ["WRAP"],
    layoutData: { left: MARGIN, right: MARGIN, top: MARGIN, bottom: MARGIN },
    text: "Etiam nisl nisi, egestas quis lacus ut, tristique suscipit metus. In vehicula lectus metus, at accumsan elit fringilla blandit. Integer et quam sed dolor pharetra molestie id eget dui. Donec ac libero eu lectus dapibus placerat eu a tellus. Fusce vulputate ac sem sit amet bibendum. Pellentesque euismod varius purus nec pharetra. Sed vitae ipsum sit amet risus vehicula euismod in at nunc. Sed in viverra arcu, id blandit risus. Praesent sagittis quis nisl id molestie. Donec dignissim, nisl id volutpat consectetur, massa diam aliquam lectus, sed euismod leo elit eu justo. Integer vel ante sapien.\n\nNunc sit amet blandit tellus, sed consequat neque. Proin vel elementum augue. Quisque gravida nulla nisl, at fermentum turpis euismod in. Maecenas vitae tortor at ante vulputate iaculis at vitae sem. Nulla dui erat, viverra eget mauris in, sodales mollis purus. Integer rhoncus suscipit mi in pulvinar. Nam metus augue, dictum a egestas ut, gravida eget ipsum. Nunc sapien nisl, mollis et mauris in, venenatis blandit magna. Nullam scelerisque tellus lacus, in lobortis purus consectetur sed. Etiam pulvinar sapien vel nibh vehicula, in lacinia odio pharetra. Duis tincidunt metus a semper auctor. Sed nec consequat augue, id vulputate orci. Nunc metus nulla, luctus id porttitor nec, interdum sed lacus. Interdum et malesuada fames ac ante ipsum primis in faucibus."
  });

  var imageLabel = scrollComposite.append("Label", {
    layoutData: { left: 0, top: 0, right: 0}
  });

  page.on("Resize", function() {
    var bounds = scrollComposite.get("bounds");
    var width = bounds[2];
    var imageHeight = width / 1.4; // 1.4 is the image aspect ratio
    imageLabel.set("image", ["images/salad.jpg", width, width]);
    var titleCompHeight = titleComposite.get("bounds")[3];
    titleComposite.set("layoutData", { left: 0, top: imageHeight - titleCompHeight, right: 0, height: 64 });
  });

  scrollComposite.on("Scroll", function(offset) {
    imageLabel.set("translationY", offset.y * 0.4);
    var titleCompY = titleComposite.get("bounds")[1];
    if (titleCompY - offset.y < 0) {
      titleComposite.set("translationY", offset.y - titleCompY);
    } else {
      titleComposite.set("translationY", 0);
    }
  });

  page.open();

});