const {Canvas, Page, device} = require('tabris');

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 300;

const page = new Page({
  title: 'Text',
  autoDispose: false
});

const canvas = new Canvas({
  centerX: 0, top: 32, width: CANVAS_WIDTH, height: CANVAS_HEIGHT
}).appendTo(page);

const scaleFactor = device.scaleFactor;
const ctx = canvas.getContext('2d', CANVAS_WIDTH * scaleFactor, CANVAS_HEIGHT * scaleFactor);
ctx.font = '14px';

ctx.scale(scaleFactor, scaleFactor);
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
