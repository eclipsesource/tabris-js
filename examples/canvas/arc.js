var CANVAS_WIDTH = 210;
var CANVAS_HEIGHT = 300;

var ARC_RADIUS = 20;

var page = module.exports = new tabris.Page({
  title: 'Arcs',
  autoDispose: false
});

var canvas = new tabris.Canvas({
  centerX: 0, top: 32, width: CANVAS_WIDTH, height: CANVAS_HEIGHT
}).appendTo(page);

new tabris.CheckBox({
  centerX: 0, top: [canvas, 16],
  text: 'Counterclockwise'
}).on('checkedChanged', function({value}) {
  clearCanvas();
  drawArcs(value);
}).appendTo(page);

var context = canvas.getContext('2d', CANVAS_WIDTH, CANVAS_HEIGHT);
context.textAlign = 'center';
context.textBaseline = 'top';

clearCanvas();
drawArcs(false);

function drawArcs(counterClockwise) {
  drawArc(10, 10, 0.25, 1.5, counterClockwise);
  drawArc(80, 10, 1, 0.5, counterClockwise);
  drawArc(160, 10, -0.5, 0.5, counterClockwise);

  drawArc(10, 80, 0.5, -0.5, counterClockwise);
  drawArc(80, 80, -1, -0.5, counterClockwise);
  drawArc(160, 80, -0.5, 1, counterClockwise);

  drawArc(10, 160, 1, 2, counterClockwise);
  drawArc(160, 160, 0, 0, counterClockwise);
  drawArc(80, 160, 0, -2.5, counterClockwise);

  drawArc(10, 240, 0, -0.5, counterClockwise);
  drawArc(80, 240, 0, 0.5, counterClockwise);
  drawArc(160, 240, 0, 2.5, counterClockwise);
}

function clearCanvas() {
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawArc(x, y, startAngle, endAngle, counterClockwise) {
  context.beginPath();
  context.moveTo(x + ARC_RADIUS, y + ARC_RADIUS);
  context.arc(x + ARC_RADIUS, y + ARC_RADIUS, ARC_RADIUS, startAngle * Math.PI, endAngle * Math.PI, counterClockwise);
  context.fillStyle = 'rgba(255, 100, 100, 0.5)';
  context.fill();
  context.fillStyle = 'black';
  context.fillText(startAngle.toString().concat(', ').concat(endAngle), x + ARC_RADIUS, y + ARC_RADIUS * 2);
}
