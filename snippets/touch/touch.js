var page = new tabris.Page({
  title: "Touch Events",
  topLevel: true
});

var textView = new tabris.TextView({
  layoutData: {left: 20, top: 20, right: 20},
  text: "Touch anywhere..."
}).appendTo(page);

var printXY = function(prefix, event) {
  textView.set("text", prefix + ": " + Math.round(event.touches[0].x) + " X " + Math.round(event.touches[0].y));
};

page.on("touchstart", function(widget, event) {
  printXY("touchstart", event);
  page.set("background", "yellow");
}).on("touchmove", function(widget, event) {
  printXY("touchmove", event);
}).on("touchend", function(widget, event) {
  printXY("touchend", event);
  page.set("background", "green");
}).on("touchcancel", function(widget, event) {
  printXY("touchcancel", event);
  page.set("background", "red");
}).on("longpress", function(widget, event) {
  page.set("background", "blue");
  printXY("longpress"  , event);
});

page.open();
