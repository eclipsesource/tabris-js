import {app, Canvas, contentView, device, sizeMeasurement} from 'tabris';

const OFFSET = 16;
const LONG_TEXT = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem ' +
  'accusantium doloremque laudantium, totam rem aperiam, eaque ipsa';

app.registerFont('pacifico', 'resources/pacifico.ttf');

contentView.append(<Canvas stretch onResize={handleDrawing}/>);

async function handleDrawing({target: canvas, width, height}) {
  const scaleFactor = device.scaleFactor;
  const ctx = canvas.getContext('2d', width * scaleFactor, height * scaleFactor);
  ctx.scale(scaleFactor, scaleFactor);
  ctx.textBaseline = 'middle';
  const measureConfigs = createMeasureConfigs(width);
  const measurements = await sizeMeasurement.measureTexts(measureConfigs);
  drawCanvas(ctx, measureConfigs, measurements);
}

function drawCanvas(ctx, measureConfigs, measurements) {
  let offsetY = OFFSET;
  for (let i = 0; i < measurements.length; i++) {
    const height = measurements[i].height;
    const width = measurements[i].width;
    const config = measureConfigs[i];
    ctx.fillStyle = i % 2 === 0 ? 'rgb(163,215,255)' : 'rgb(255,149,154)';
    ctx.fillRect(OFFSET, offsetY, width, height);
    ctx.fillStyle = 'black';
    ctx.font = config.font.toString();
    ctx.fillText(config.text, OFFSET, offsetY + height / 2);
    offsetY += height + OFFSET;
  }
}

function createMeasureConfigs(width) {
  return [
    {text: 'Natively measured', font: '12px'},
    {text: 'Hallo World', font: 'bold 12px', maxWidth: width},
    {text: 'Tabris.js', font: 'italic 24px'},
    {text: 'Lorem Ipsum', font: 'italic light 24px'},
    {text: 'Mono Lorem Ipsum', font: '12px monospace'},
    {text: 'West coast', font: '40px pacifico'},
    {text: 'Markup is <b>parsed</b>', font: 'bold 16px', markupEnabled: true},
    {text: 'Markup is <b>ignored</b>', font: 'black 16px', markupEnabled: false},
    {text: LONG_TEXT, font: 'italic medium 14px'},
    {text: LONG_TEXT, font: '24px', maxWidth: width - OFFSET * 2}
  ];
}
