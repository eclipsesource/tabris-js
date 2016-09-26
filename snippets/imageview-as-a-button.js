var touched = 0;
new tabris.ImageView({
  layoutData: {centerX: 0, centerY: 0},
  image: {src: "images/target_200.png"},
  highlightOnTouch: true
}).on("tap", function() {
  touched++;
  touchedLabel.set("text", "touched " + touched + " times");
}).appendTo(tabris.ui.contentView);
var touchedLabel = new tabris.TextView({
  top: "prev() 10", centerX: 0
}).appendTo(tabris.ui.contentView);
