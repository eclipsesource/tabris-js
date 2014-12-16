var page = tabris.create("Page", {
  title: "Text",
  topLevel: true
});

var canvas = tabris.create("Canvas", {
  layoutData: {left: 10, top: 10, right: 10, bottom: 10}
}).appendTo(page);

var ctx = tabris.getContext(canvas, 300, 300);
ctx.strokeStyle = "red";

var x = 50;
var y = 50;

ctx.moveTo(5, y);
ctx.lineTo(295, y);
ctx.stroke();
ctx.textAlign = "center";
["top", "bottom", "middle"].forEach(function(mode) {
  ctx.textBaseline = mode;
  ctx.fillText(mode, x, y);
  x += 100;
});

x = 50;
y = 100;

ctx.moveTo(5, y);
ctx.lineTo(295, y);
ctx.stroke();
["hanging", "alphabetic", "ideographic"].forEach(function(mode) {
  ctx.textBaseline = mode;
  ctx.fillText(mode, x, y);
  x += 100;
});

x = 150;
y = 170;

ctx.moveTo(x, 150);
ctx.lineTo(x, 270);
ctx.stroke();
ctx.textBaseline = "middle";
["start", "end", "left", "right", "center"].forEach(function(mode) {
  ctx.textAlign = mode;
  ctx.fillText(mode, x, y);
  y += 20;
});
