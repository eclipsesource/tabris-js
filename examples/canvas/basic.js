var page = module.exports = new tabris.Page({
  title: 'Basic Shapes',
  autoDispose: false
});

var canvas = new tabris.Canvas({
  left: 10, top: 10, right: 10, bottom: 10
}).appendTo(page);

var ctx = canvas.getContext('2d', 400, 400);

ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
ctx.fillRect(50, 20, 20, 80);
ctx.fillStyle = 'rgba(100, 100, 255, 0.5)';
ctx.fillRect(20, 50, 80, 20);
ctx.fillText('transparency', 20, 120);

drawPolygon(ctx, 20, 150);
ctx.stroke();
ctx.fillText('polygon', 20, 225);

drawArc(ctx, 20, 250);
ctx.fill();
ctx.stroke();
ctx.fillText('arc', 20, 345);

ctx.strokeStyle = 'blue';
drawLinear(ctx, 140, 20);
ctx.stroke();
ctx.fillText('linear', 140, 75);

ctx.lineWidth = 2;
ctx.strokeStyle = 'purple';
drawQuadratic(ctx, 140, 100);
ctx.stroke();
ctx.fillText('quadratic', 140, 155);

ctx.lineWidth = 4;
ctx.strokeStyle = 'olive';
drawBezier(ctx, 140, 180);
ctx.stroke();
ctx.fillText('bezier', 140, 240);

function drawLinear(ctx, x, y) {
  ctx.beginPath();
  ctx.moveTo(x, y + 25);
  ctx.lineTo(x + 25, y + 10);
  ctx.lineTo(x + 75, y + 40);
  ctx.lineTo(x + 100, y + 25);
}

function drawQuadratic(ctx, x, y) {
  ctx.beginPath();
  ctx.moveTo(x, y + 25);
  ctx.quadraticCurveTo(x + 25, y, x + 50, y + 25);
  ctx.quadraticCurveTo(x + 75, y + 50, x + 100, y + 25);
}

function drawBezier(ctx, x, y) {
  ctx.beginPath();
  ctx.moveTo(x, y + 25);
  ctx.bezierCurveTo(x, y, x + 50, y, x + 50, y + 25);
  ctx.bezierCurveTo(x + 50, y + 50, x + 100, y + 50, x + 100, y + 25);
}

function drawPolygon(ctx, x, y) {
  ctx.beginPath();
  ctx.moveTo(x, y + 30);
  ctx.lineTo(x + 50, y);
  ctx.lineTo(x + 100, y + 30);
  ctx.lineTo(x + 50, y + 60);
  ctx.closePath();
}

function drawArc(ctx, x, y) {
  ctx.beginPath();
  ctx.moveTo(x + 40, y + 40);
  ctx.arc(x + 40, y + 40, 40, Math.PI / 4, -Math.PI / 4);
  ctx.closePath();
}
