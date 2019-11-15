import {Canvas, contentView, device, ImageView, Stack, TextView} from 'tabris';

tabris.contentView.background = '#efefef';

contentView.append(
  <$>
    <Canvas stretchX background='white' onResize={handleDrawing} elevation={4}/>
    <Stack left={16} right='66%' top='Canvas 24' background='white' elevation={4}>
      <ImageView id='toBlob' stretch/>
      <TextView stretchX alignment='centerX' text='Canvas.toBlob()' maxLines={1}/>
    </Stack>
    <Stack left='33% 8' right='33% 8' top='Canvas 24' background='white' elevation={4}>
      <ImageView id='createImageBitmap' stretch/>
      <TextView stretchX alignment='centerX' text='createImageBitmap' maxLines={1}/>
    </Stack>
    <Stack left='66%' top='Canvas 24' right={16} background='white' elevation={4}>
      <ImageView id='imageData' stretch/>
      <TextView stretchX alignment='centerX' text='ImageData' maxLines={1}/>
    </Stack>
  </$>
);

/** @param {tabris.WidgetResizeEvent<Canvas>} ev */
async function handleDrawing({target: canvas, width, height}) {
  canvas.height = canvas.bounds.width;
  const scale = device.scaleFactor;
  const size = width * scale;
  const ctx = canvas.getContext('2d', size, size);
  ctx.scale(scale, scale);
  drawCanvas(size, ctx);
  await extractImages(canvas, ctx);
}

function drawCanvas(size, ctx) {
  const scale = device.scaleFactor;
  const circleCenter = size / 2 / scale;
  ctx.fillStyle = 'rgb(217,61,72)';
  ctx.beginPath();
  ctx.arc(circleCenter, circleCenter, circleCenter / 2, 0, 2 * Math.PI);
  ctx.fill();
  ctx.strokeStyle = 'rgb(78, 154, 217)';
  ctx.lineWidth = 10;
  ctx.moveTo(20, 20);
  ctx.lineTo(size / scale - 40, size / scale - 40);
  ctx.stroke();
}

async function extractImages(canvas, ctx) {
  try {
    // extract image via Canvas.toBlob()
    canvas.toBlob(async (blob) => $('#toBlob').only(ImageView).image = await createImageBitmap(blob));

    // extract image via createImageBitmap(canvas)
    $('#createImageBitmap').only(ImageView).image = await createImageBitmap(canvas);

    // extract image via ImageData
    const size = canvas.bounds.width * device.scaleFactor;
    const imageData = ctx.getImageData(0, 0, size, size);
    $('#imageData').only(ImageView).image = await createImageBitmap(imageData);
  } catch (e) {
    console.log(e);
  }
}
