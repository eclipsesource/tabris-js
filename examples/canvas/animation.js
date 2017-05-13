let example = new Example();

let page = module.exports = new tabris.Page({
  title: 'Animation',
  autoDispose: false
}).on('disappear', () => {
  page.children('#animateCheckBox').set('checked', false);
});

new tabris.Canvas({
  left: 10, top: 10, right: 10, bottom: '#animateCheckBox 10'
}).on('resize', function({target, width, height}) {
  let contextHeight = Math.min(height, Math.floor(width / 2));
  let ctx = target.getContext('2d', width, contextHeight);
  example.init(ctx);
}).appendTo(page);

new tabris.CheckBox({
  centerX: 0, bottom: 10,
  text: 'Animate',
  id: 'animateCheckBox'
}).on('checkedChanged', ({value: checked}) => {
  example.setRunning(checked);
}).appendTo(page);

function Example() {
  let ctx, width, height, cx, cy, unit;
  let angle = 0;
  let timerId = null;
  let running = false;

  this.init = function(newCtx) {
    ctx = newCtx;
    width = ctx.canvas.width;
    height = ctx.canvas.height;
    ctx.font = '18px sans-serif';
    ctx.lineJoin = 'round';
    cx = Math.floor(width / 3);
    cy = Math.floor(height / 2);
    unit = width / 12;
    // initial draw
    if (!running) {
      draw();
    }
  };

  this.setRunning = function(value) {
    if (value && !running) {
      this.start();
    } else if (!value && running) {
      this.stop();
    }
  };

  this.start = function() {
    clearTimeout(timerId);
    running = true;
    draw();
  };

  this.stop = function() {
    clearTimeout(timerId);
    running = false;
  };

  function draw() {
    clear();
    drawAxes(angle);
    drawSine(angle);
    drawCircle(angle);
    drawLever(angle);
    drawFpsLabel();
    speedometer.update();
    angle = normalizeAngle(angle - Math.PI / 90);
    // re-schedule
    if (running) {
      timerId = setTimeout(draw, 0);
    }
  }

  function clear() {
    ctx.clearRect(0, 0, width, height);
  }

  function normalizeAngle(angle) {
    return angle > Math.PI * 2 ? angle - Math.PI * 2 : angle < 0 ? angle + Math.PI * 2 : angle;
  }

  function drawAxes(angle) {
    let p = normalizeAngle(Math.PI * 2 - angle);
    let p2 = normalizeAngle(Math.PI - angle);
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // x and y axes
    ctx.moveTo(cx - 3 * unit, cy);
    ctx.lineTo(cx + 2.25 * Math.PI * unit, cy);
    ctx.moveTo(cx, cy - 1.5 * unit);
    ctx.lineTo(cx, cy + 1.5 * unit);
    // x axis ticks
    ctx.moveTo(cx + p * unit, cy - 5);
    ctx.lineTo(cx + p * unit, cy + 5);
    ctx.moveTo(cx + p2 * unit, cy - 5);
    ctx.lineTo(cx + p2 * unit, cy + 5);
    // y axis ticks
    ctx.moveTo(cx - 5, cy + unit);
    ctx.lineTo(cx + 5, cy + unit);
    ctx.moveTo(cx - 5, cy - unit);
    ctx.lineTo(cx + 5, cy - unit);
    ctx.stroke();
    // x axis labels
    ctx.fillStyle = '#aaa';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('π', cx + p * unit, cy + 8);
    ctx.fillText('2π', cx + p2 * unit, cy + 8);
    // y axis labels
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('1', cx + 8, cy - unit);
    ctx.fillText('-1', cx + 8, cy + unit);
  }

  function drawSine(angle) {
    let x, y;
    let steps = 50;
    ctx.beginPath();
    ctx.moveTo(cx, cy + Math.sin(angle) * unit);
    for (let i = 0; i <= steps; i++) {
      x = i * 2 * Math.PI / steps;
      y = Math.sin(angle + x);
      ctx.lineTo(cx + x * unit, cy + y * unit);
    }
    ctx.strokeStyle = '#fa0';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawCircle() {
    let ccx = cx - 1.5 * unit;
    ctx.strokeStyle = '#0af';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ccx, cy, unit, 0, 2 * Math.PI);
    ctx.stroke();
  }

  function drawLever(t) {
    let ccx = cx - 1.5 * unit;
    let x = ccx + Math.cos(t) * unit;
    let y = cy + Math.sin(t) * unit;
    ctx.strokeStyle = '#0af';
    ctx.fillStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // lines
    ctx.moveTo(x, y);
    ctx.lineTo(cx, y);
    ctx.moveTo(ccx, cy);
    ctx.lineTo(x, y);
    ctx.stroke();
    // hinges
    ctx.lineWidth = 1;
    ctx.beginPath();
    let radius = 3;
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.moveTo(cx + radius / 2, y);
    ctx.arc(cx, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  }

  function drawFpsLabel() {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#000';
    ctx.lineWidth = 1;
    ctx.fillText('FPS: ' + speedometer.fps.toFixed(1), 10, 10);
  }

  let speedometer = {
    start: 0,
    count: 0,
    fps: 0,
    update: function() {
      let now = Date.now();
      let time = now - this.start;
      this.count++;
      if (this.start === 0) {
        this.start = now;
      } else if (time >= 1000) {
        this.fps = this.count / (time / 1000);
        this.start = now;
        this.count = 0;
      }
    }
  };
}
