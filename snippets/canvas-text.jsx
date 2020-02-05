import {Canvas, contentView, device} from 'tabris';

contentView.append(
  <Canvas center width={300} height={300} onResize={(e) => drawTexts(e)}/>
);

function drawTexts({target: canvas, width, height}) {
  const scaleFactor = device.scaleFactor;
  const ctx = canvas.getContext('2d', width * scaleFactor, height * scaleFactor);
  ctx.scale(scaleFactor, scaleFactor);
  ctx.font = '14px';
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
}
