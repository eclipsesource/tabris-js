tabris.load(function() {

  var CANVAS_SIZE = 300;
  var ARC_RADIUS = 20;

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

  function drawArc(context, x, y, startAngle, endAngle, counterClockwise) {
    context.beginPath();
    context.moveTo(x + ARC_RADIUS, y + ARC_RADIUS);
    context.arc(x + ARC_RADIUS, y + ARC_RADIUS, ARC_RADIUS, startAngle * Math.PI, endAngle * Math.PI, counterClockwise);
    context.fillStyle = "rgba(255, 100, 100, 0.5)";
    context.fill();
    context.fillStyle = "black";
    context.fillText(startAngle.toString().concat(", ").concat(endAngle), x + ARC_RADIUS, y + ARC_RADIUS * 2);
  }

  function clearCanvas() {
    context.beginPath();
    context.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    context.fillStyle = 'white';
    context.fill();
  }

  var page = tabris.createPage({
    title: "Arcs",
    topLevel: true
  });

  var canvas = page.append("Canvas", {
    layoutData: {left: 10, top: 10, right: 10, height: CANVAS_SIZE}
  });

  var context = tabris.getContext(canvas, CANVAS_SIZE, CANVAS_SIZE);
  context.textAlign = "center";
  context.textBaseline = "top";

  var checkBox = page.append("CheckBox", {
    text: "Counterclockwise",
    layoutData: {left: 0, right: 0, top: [canvas, 8]}
  });

  checkBox.on("selection", function() {
    clearCanvas();
    drawArcs(checkBox.get("selection"));
  });

  clearCanvas();
  drawArcs(false);

});
