tabris.load(function() {

  var RADIUS = 20;

  function drawArc(ctx, x, y, startAngel, endAngel, counterClockwise) {
    ctx.beginPath();
    ctx.moveTo(x + RADIUS, y + RADIUS);
    ctx.arc(x + RADIUS, y + RADIUS, RADIUS, startAngel * Math.PI, endAngel * Math.PI, counterClockwise);
    ctx.fillStyle = "rgba(255, 100, 100, 0.5)";
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.strokeText(startAngel.toString().concat(", ").concat(endAngel), x, y + RADIUS * 2);
  }

  var page = tabris.createPage({
    title: "Arcs",
    topLevel: true
  });

  var canvasSize = 300;
  var canvas = page.append("Canvas", {
    layoutData: {left: 10, top: 10, right: 10, height: canvasSize}
  });

  var context = tabris.getContext(canvas, canvasSize, canvasSize);

  context.fillStyle = "rgba(255, 100, 100, 0.5)";

  function drawArcs(counterClockwise) {
    drawArc(context, 10, 10, 0.25, 1.5, counterClockwise);
    drawArc(context, 80, 10, 1, 0.5, counterClockwise);
    drawArc(context, 160, 10, -0.5, 0.5, counterClockwise);

    drawArc(context, 10, 80, 0.5, -0.5, counterClockwise);
    drawArc(context, 80, 80, -1, -0.5, counterClockwise);
    drawArc(context, 160, 80, -0.5, 1, counterClockwise);

    drawArc(context, 10, 160, 1, 2, counterClockwise);
    drawArc(context, 160, 160, 0, 0, counterClockwise);
    drawArc(context, 80, 160, 0, -2.5, counterClockwise);

    drawArc(context, 10, 240, 0, -0.5, counterClockwise);
    drawArc(context, 80, 240, 0, 0.5, counterClockwise);
    drawArc(context, 160, 240, 0, 2.5, counterClockwise);
  }

  function clearCanvas() {
    context.beginPath();
    context.rect(0, 0, canvasSize, canvasSize);
    context.fillStyle = 'white';
    context.fill();
  }

  var checkBox = page.append("CheckBox", {
    text: "Counterclockwise",
    layoutData: {left: 0, right: 0, top: [canvas, 8]}
  });

  checkBox.on("Selection", function() {
    clearCanvas();
    drawArcs(checkBox.get("selection"));
  });

  clearCanvas();
  drawArcs(false);

});
