var page = tabris.create("Page", {
  title: "Scroll Composite - Horizontal",
  topLevel: true
});

var scrollView = tabris.create("ScrollView", {
  left: 0, right: 0, top: "40%", bottom: "40%",
  direction: "horizontal",
  background: "#234"
}).appendTo(page);

for (var i = 0; i <= 50; i++) {
  tabris.create("TextView", {
    layoutData: {left: i * 30 + 20, centerY: 0, width: 30},
    textColor: "white",
    text: i + "°"
  }).appendTo(scrollView);
}

tabris.create("Button", {
  left: 10, bottom: 10,
  text: "scroll"
}).on("select", function() {
  scrollView.set("scrollX", 310);
}).appendTo(page);

page.open();
