var MARGIN_SMALL = 4;
var MARGIN = 8;

var titleCompY = 0;

var page = tabris.create("Page", {
  topLevel: true,
  title: "Aud'cuisine"
});

var scrollView = tabris.create("ScrollView", {
  left: 0, right: 0, top: 0, bottom: 0
}).appendTo(page);

var imageView = tabris.create("ImageView", {
  left: 0, top: 0, right: 0,
  image: "images/salad.jpg",
  scaleMode: "fill"
}).appendTo(scrollView);

var titleComposite = tabris.create("Composite", {
  left: 0, right: 0,
  id: "titleComposite",
  background: "rgba(255,152,0,0.9)"
}).appendTo(scrollView);

tabris.create("TextView", {
  left: MARGIN, top: MARGIN, right: MARGIN,
  markupEnabled: true,
  text: "<b>The perfect side dish</b>",
  font: "16px",
  textColor: "black"
}).appendTo(titleComposite);

tabris.create("TextView", {
  left: MARGIN, bottom: MARGIN_SMALL, right: MARGIN, top: "prev()",
  markupEnabled: true,
  text: "<b>INDIAN SUMMER SALAD</b>",
  font: "24px",
  textColor: "white"
}).appendTo(titleComposite);

var contentComposite = tabris.create("Composite", {
  left: 0, right: 0, top: "#titleComposite", height: 1000,
  background: "white"
}).appendTo(scrollView);

tabris.create("TextView", {
  left: MARGIN, right: MARGIN, top: MARGIN,
  text: "Etiam nisl nisi, egestas quis lacus ut, tristique suscipit metus. In vehicula lectus " +
        "metus, at accumsan elit fringilla blandit. Integer et quam sed dolor pharetra " +
        "molestie id eget dui. Donec ac libero eu lectus dapibus placerat eu a tellus. Fusce " +
        "vulputate ac sem sit amet bibendum. Pellentesque euismod varius purus pharetra. Sed " +
        "vitae ipsum sit amet risus vehicula euismod in at nunc. Sed in viverra arcu, id " +
        "blandit. Praesent sagittis quis nisl id molestie. Donec dignissim, nisl id volutpat " +
        "consectetur, massa diam aliquam lectus, sed euismod leo elit eu justo. Integer vel " +
        "ante sapien.\n\nNunc sit amet blandit tellus, sed neque. Proin vel elementum augue. " +
        "Quisque gravida nulla nisl, at fermentum turpis euismod in. Maecenas tortor at ante " +
        "vulputate iaculis at vitae sem. Nulla dui erat, viverra eget mauris in, sodales " +
        "mollis. Integer rhoncus suscipit mi in pulvinar. Nam metus augue, dictum a egestas " +
        "ut, gravida eget ipsum. Nunc nisl, mollis et mauris in, venenatis blandit magna. " +
        "Nullam scelerisque tellus lacus, in lobortis purus consectetur sed. Etiam pulvinar " +
        "sapien vel nibh vehicula, in lacinia odio pharetra. Duis tincidunt metus a semper " +
        "auctor. Sed nec consequat augue, id vulputate orci. Nunc metus nulla, luctus id " +
        "porttitor nec, sed lacus. Interdum et malesuada fames ac ante ipsum primis in faucibus."
}).appendTo(contentComposite);

scrollView.on("resize", function(widget, bounds) {
  var imageHeight = bounds.height / 2;
  imageView.set("height", imageHeight);
  var titleCompHeight = titleComposite.get("bounds").height;
  // We need the offset of the title composite in each scroll event.
  // As it can only change on resize, we assign it here.
  titleCompY = Math.min(imageHeight - titleCompHeight, bounds.height / 2);
  titleComposite.set("top", titleCompY);
});

scrollView.on("scroll", function(widget, offset) {
  imageView.set("transform", {translationY: Math.max(0, offset.y * 0.4)});
  titleComposite.set("transform", {translationY: Math.max(0, offset.y - titleCompY)});
});

page.open();
