import {Canvas, CheckBox, contentView, device, Stack} from 'tabris';

const ARC_RADIUS = 20;

contentView.append(
  <Stack center alignment='centerX' spacing={16}>
    <Canvas width={210} height={300} onResize={drawArcs}/>
    <CheckBox text='Clockwise' checked onCheckedChanged={drawArcs}/>
  </Stack>
);

function drawArcs() {
  const counterClockwise = !$(CheckBox).only().checked;
  const canvas = $(Canvas).only();
  const width = canvas.bounds.width;
  const height = canvas.bounds.height;
  const scaleFactor = device.scaleFactor;
  const ctx = canvas.getContext('2d', width * scaleFactor, height * scaleFactor);
  ctx.scale(scaleFactor, scaleFactor);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.clearRect(0, 0, width, height);

  drawArc(ctx, 10, 10, 0.25, 1.5, counterClockwise);
  drawArc(ctx, 80, 10, 1, 0.5, counterClockwise);
  drawArc(ctx, 160, 10, -0.5, 0.5, counterClockwise);

  drawArc(ctx, 10, 80, 0.5, -0.5, counterClockwise);
  drawArc(ctx, 80, 80, -1, -0.5, counterClockwise);
  drawArc(ctx, 160, 80, -0.5, 1, counterClockwise);

  drawArc(ctx, 10, 160, 1, 2, counterClockwise);
  drawArc(ctx, 160, 160, 0, 0, counterClockwise);
  drawArc(ctx, 80, 160, 0, -2.5, counterClockwise);

  drawArc(ctx, 10, 240, 0, -0.5, counterClockwise);
  drawArc(ctx, 80, 240, 0, 0.5, counterClockwise);
  drawArc(ctx, 160, 240, 0, 2.5, counterClockwise);
}

function drawArc(ctx, x, y, startAngle, endAngle, counterClockwise) {
  ctx.beginPath();
  ctx.moveTo(x + ARC_RADIUS, y + ARC_RADIUS);
  ctx.arc(x + ARC_RADIUS, y + ARC_RADIUS, ARC_RADIUS, startAngle * Math.PI, endAngle * Math.PI, counterClockwise);
  ctx.fillStyle = '#00a4ff';
  ctx.fill();
  ctx.fillStyle = 'black';
  ctx.fillText(startAngle.toString().concat(', ').concat(endAngle), x + ARC_RADIUS, y + ARC_RADIUS * 2);
}
