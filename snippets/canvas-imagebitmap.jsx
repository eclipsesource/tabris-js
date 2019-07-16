import {Canvas, contentView, device} from 'tabris';

(async () => {

  const response = await fetch('resources/target_200.png');
  const image = await createImageBitmap(await response.blob());
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
    ctx.drawImage(image, 50, 50);
  }

})();
