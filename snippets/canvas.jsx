import {Canvas, contentView, device} from 'tabris';

contentView.append(<Canvas stretch onResize={draw}/>);

/** @param {tabris.WidgetResizeEvent<Canvas>} ev */
function draw({target: canvas, width, height}) {
  const scaleFactor = device.scaleFactor;
  const ctx = canvas.getContext('2d', width * scaleFactor, height * scaleFactor);
  ctx.scale(scaleFactor, scaleFactor);
  ctx.strokeStyle = 'rgb(78, 154, 217)';
  ctx.lineWidth = 10;
  ctx.moveTo(20, 20);
  ctx.lineTo(width - 40, height - 40);
  ctx.stroke();
  ctx.putImageData(createImageData(80, 40), 100, 100);
  const data = ctx.getImageData(0, 0, 100, 100);
  ctx.putImageData(data, 180, 100);
}

/**
 * @param {number} width
 * @param {number} height
 * @returns {ImageData}
 */
function createImageData(width, height) {
  /** @type {number[]} */
  const array = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = x % 20 > y % 20 ? 255 : 0;
      array.push(200, 0, 0, alpha);
    }
  }
  return new ImageData(new Uint8ClampedArray(array), width, height);
}
