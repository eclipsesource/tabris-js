var scrollView = new tabris.ScrollView({
  left: 0, right: 0, top: "40%", bottom: "40%",
  direction: "horizontal",
  background: "#234"
}).appendTo(tabris.ui.contentView);

for (var i = 0; i <= 50; i++) {
  new tabris.TextView({
    layoutData: {left: i * 30 + 20, centerY: 0, width: 30},
    textColor: "white",
    text: i + "°"
  }).appendTo(scrollView);
}

new tabris.Button({
  left: 16, bottom: 16,
  text: "scroll"
}).on("select", function() {
  scrollView.scrollToX(310);
}).appendTo(tabris.ui.contentView);
