const {Canvas, Page} = require('tabris');

let page = new Page({
  title: 'Text',
  autoDispose: false
});

let canvas = new Canvas({
  left: 10, top: 10, right: 10, bottom: 10
}).appendTo(page);

let ctx = canvas.getContext('2d', 300, 300);
ctx.strokeStyle = 'red';

let x = 50;
let y = 50;

ctx.moveTo(5, y);
ctx.lineTo(295, y);
ctx.stroke();
ctx.textAlign = 'center';
['top', 'bottom', 'middle'].forEach((mode) => {
  ctx.textBaseline = mode;
  ctx.fillText(mode, x, y);
  x += 100;
});

x = 50;
y = 100;

ctx.moveTo(5, y);
ctx.lineTo(295, y);
ctx.stroke();
['hanging', 'alphabetic', 'ideographic'].forEach((mode) => {
  ctx.textBaseline = mode;
  ctx.fillText(mode, x, y);
  x += 100;
});

x = 150;
y = 170;

ctx.moveTo(x, 150);
ctx.lineTo(x, 270);
ctx.stroke();
ctx.textBaseline = 'middle';
['start', 'end', 'left', 'right', 'center'].forEach((mode) => {
  ctx.textAlign = mode;
  ctx.fillText(mode, x, y);
  y += 20;
});

module.exports = page;
