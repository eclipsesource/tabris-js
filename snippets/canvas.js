// Draw shapes on a canvas using HTML5 Canvas API

new tabris.Canvas({
  left: 10, top: 10, right: 10, bottom: 10
}).on('resize', function({target: canvas, width, height}) {
  var ctx = canvas.getContext('2d', width, height);
  ctx.strokeStyle = 'rgb(78, 154, 217)';
  ctx.lineWidth = 10;
  ctx.moveTo(20, 20);
  ctx.lineTo(width - 40, height - 40);
  ctx.stroke();

  // draw image
  ctx.putImageData(createImageData(80, 40), 100, 100);

  // copy region
  var data = ctx.getImageData(0, 0, 100, 100);
  ctx.putImageData(data, 180, 100);

}).appendTo(tabris.ui.contentView);

function createImageData(width, height) {
  var array = [];
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      var alpha = x % 20 > y % 20 ? 255 : 0;
      array.push(200, 0, 0, alpha);
    }
  }
  return new ImageData(new Uint8ClampedArray(array), width, height);
}
