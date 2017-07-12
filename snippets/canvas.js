const {Canvas, ui, device} = require('tabris');

// Draw shapes on a canvas using HTML5 Canvas API

new Canvas({
  left: 10, top: 10, right: 10, bottom: 10
}).on('resize', ({target: canvas, width, height}) => {
  let scaleFactor = device.scaleFactor;
  let ctx = canvas.getContext('2d', width * scaleFactor, height * scaleFactor);
  ctx.scale(scaleFactor, scaleFactor);
  ctx.strokeStyle = 'rgb(78, 154, 217)';
  ctx.lineWidth = 10;
  ctx.moveTo(20, 20);
  ctx.lineTo(width - 40, height - 40);
  ctx.stroke();

  // draw image
  ctx.putImageData(createImageData(80, 40), 100, 100);

  // copy region
  let data = ctx.getImageData(0, 0, 100, 100);
  ctx.putImageData(data, 180, 100);

}).appendTo(ui.contentView);

function createImageData(width, height) {
  let array = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let alpha = x % 20 > y % 20 ? 255 : 0;
      array.push(200, 0, 0, alpha);
    }
  }
  return new ImageData(new Uint8ClampedArray(array), width, height);
}
