import {Canvas, contentView, device} from 'tabris';

contentView.append(
  <Canvas width={300} height={300} center onResize={(e) => drawShapes(e)}/>
);

function drawShapes({target: canvas, width, height}) {
  const scaleFactor = device.scaleFactor;
  const ctx = canvas.getContext('2d', width * scaleFactor, height * scaleFactor);
  ctx.scale(scaleFactor, scaleFactor);
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';

  ctx.fillStyle = '#db4437aa';
  ctx.fillRect(40, 20, 80, 60);
  ctx.fillStyle = '#3f51b5aa';
  ctx.fillRect(60, 40, 80, 60);
  ctx.fillStyle = '#8dbd00aa';
  ctx.fillRect(20, 60, 80, 60);
  ctx.fillStyle = 'black';
  ctx.fillText('transparency', 80, 130);

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#db4437';
  drawLinear(ctx, 220, 40);
  ctx.stroke();

  ctx.strokeStyle = '#3f51b5';
  drawQuadratic(ctx, 220, 70);
  ctx.stroke();

  ctx.strokeStyle = '#8dbd00';
  drawBezier(ctx, 220, 100);
  ctx.stroke();
  ctx.fillText('curves', 220, 130);

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'black';
  drawPath(ctx, 80, 220, 50);
  ctx.stroke();
  ctx.fillText('path', 80, 270);

  drawArc(ctx, 220, 220, 45);
  ctx.fillStyle = '#fed100';
  ctx.fill();
  ctx.fillStyle = 'black';
  ctx.fillText('arc', 220, 270);
}

function drawLinear(ctx, x, y) {
  ctx.beginPath();
  ctx.moveTo(x - 50, y);
  ctx.lineTo(x - 25, y - 15);
  ctx.lineTo(x + 25, y + 15);
  ctx.lineTo(x + 50, y);
}

function drawQuadratic(ctx, x, y) {
  ctx.beginPath();
  ctx.moveTo(x - 50, y);
  ctx.quadraticCurveTo(x - 25, y - 25, x, y);
  ctx.quadraticCurveTo(x + 25, y + 25, x + 50, y);
}

function drawBezier(ctx, x, y) {
  ctx.beginPath();
  ctx.moveTo(x - 50, y);
  ctx.bezierCurveTo(x - 50, y - 25, x, y - 25, x, y);
  ctx.bezierCurveTo(x, y + 25, x + 50, y + 25, x + 50, y);
}

function drawPath(ctx, x, y, radius) {
  ctx.beginPath();
  const rotate = -Math.PI / 2;
  ctx.moveTo(x, y - radius);
  for (let i = 0; i <= 4 * Math.PI; i += (4 * Math.PI) / 5) {
    ctx.lineTo(x + radius * Math.cos(i + rotate), y + radius * Math.sin(i + rotate));
  }
  ctx.closePath();
}

function drawArc(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, radius, Math.PI / 4, -Math.PI / 4);
  ctx.closePath();
}
