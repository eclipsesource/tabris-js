var page = new tabris.Page({
  title: "TabFolder",
  topLevel: true
});

var tabFolder = new tabris.TabFolder({
  layoutData: {left: 0, top: 0, right: 0, bottom: 0},
  paging: true // enables swiping. To still be able to open the developer console in iOS, swipe from the bottom right.
}).appendTo(page);

var createTab = function(title, image, seletedImage) {
  var tab = new tabris.Tab({
    title: title, // converted to upper-case on Android
    image: {src: image, scale: 2},
    selectedImage: {src: seletedImage, scale: 2}
  }).appendTo(tabFolder);
  new tabris.TextView({
    layoutData: {centerX: 0, centerY: 0},
    text: "Content of Tab " + title
  }).appendTo(tab);
};

createTab("Cart", "images/cart.png", "images/cart-filled.png");
createTab("Pay", "images/card.png", "images/card-filled.png");
createTab("Statistic", "images/chart.png", "images/chart-filled.png");

page.open();

tabFolder.on("change:selection", function(widget, tab) {
  console.log(tab.get("title"));
});
