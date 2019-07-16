const {Canvas, ui, device,} = require('tabris');

fetch('resources/target_200.png')
  .then(response => response.blob())
  .then(blob => createImageBitmap(blob))
  .then(image => {

    ui.contentView.append(
      new Canvas({left: 0, top: 0, right: 0, bottom: 0})
        .on({resize: draw})
    );

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

  });
