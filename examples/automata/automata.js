var DEBUG = true;

tabris.load(function() {

  // var height = Ti.Platform.displayCaps.platformHeight;
  // var width = Ti.Platform.displayCaps.platformWidth;
  var width = 300; //bounds[2];
  var height = 400; //bounds[3];

  var CELL_SIZE = 5; //Math.floor(Math.min(height, width) / 2);
  var xSize = width / CELL_SIZE;
  var ySize = height / CELL_SIZE;

  //var universe = Ti.UI.createWindow({
  //  backgroundColor: '#000',
  //  modal: false,
  //  exitOnClose: true
  //});
  var page = tabris.createPage({
    title: "Automata",
    topLevel: true,
    background: '#000'
  });

  // TODO [rst] Move down when z-order is fixed
  var label = page.append( "Label", {
    bounds: [0, 0, 80, 40],
    background: "rgba(255, 0, 0, 0.8)",
    foreground: "#fff",
    text: "FPS"
  });

  function getNextState(x, y, alive) {
    var count = 0,
      xm1 = x > 0,
      xp1 = x + 1 < xSize,
      ym1 = y > 0,
      yp1 = y + 1 < ySize;

    if (xm1) {
      if (ym1 && cells[x - 1][y - 1].lastAlive) {
        count++;
      }
      if (cells[x - 1][y].lastAlive) {
        count++;
      }
      if (yp1 && cells[x - 1][y + 1].lastAlive) {
        count++;
      }
    }
    if (xp1) {
      if (ym1 && cells[x + 1][y - 1].lastAlive) {
        count++;
      }
      if (cells[x + 1][y].lastAlive) {
        count++;
      }
      if (yp1 && cells[x + 1][y + 1].lastAlive) {
        count++;
      }
    }
    if (ym1 && cells[x][y - 1].lastAlive) {
      count++;
    }
    if (yp1 && cells[x][y + 1].lastAlive) {
      count++;
    }

    return (alive && (count === 2 || count === 3)) || (!alive && count === 3);
  }

  // seed the grid
  var cells = [];
  for (var x = 0; x < xSize; x++) {
    cells[x] = [];
    for (var y = 0; y < ySize; y++) {
      var alive = Math.random() >= 0.5;
      var composite = page.append("Composite", {
        bounds: [x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE],
        background: "#fff",
        visibility: alive
      });
      cells[x][y] = {
        // proxy: Ti.UI.createView({
        //   height: CELL_SIZE,
        //   width: CELL_SIZE,
        //   backgroundColor: '#fff',
        //   top: y*CELL_SIZE,
        //   left: x*CELL_SIZE,
        //   touchEnabled: false,
        //   visible: alive
        // }),
        proxy: composite,
        lastAlive: alive,
        alive: alive
      };
      // universe.add(cells[x][y].proxy);
    }
  }

  //// add FPS label
  //var label = Ti.UI.createLabel({
  //  text: 'FPS: ',
  //  color: '#fff',
  //  backgroundColor: '#a00',
  //  height: 40,
  //  width: 80,
  //  top: 0,
  //  left: 0,
  //  textAlign: 'center',
  //  opacity: 0.8
  //});
  //universe.add(label);

  var time = new Date().getTime();

  //
  //universe.open();
  page.open();

  if (DEBUG) {
    var count;
    var start = new Date().getTime();
  }

  var run = function() {
    var x, y, cell;
    var render = function() {
      // render current generation
      for (x = 0; x < xSize; x++) {
        for (y = 0; y < ySize; y++) {
          cell = cells[x][y];

          // minimze number of times we need to modify the proxy object
          if (cell.alive !== cell.lastAlive) {
            // cell.proxy.visible = cell.alive;
            cell.proxy.set("visibility", cell.alive);
          }

          // save the state
          cell.lastAlive = cell.alive;
        }
      }

      // build next generation
      for (x = 0; x < xSize; x++) {
        for (y = 0; y < ySize; y++) {
          cell = cells[x][y];
          cell.alive = getNextState(x, y, cell.lastAlive);
        }
      }

      if (DEBUG) {
        count++;
        var curTime = new Date().getTime();
        var diff = curTime - start;
        if (diff >= 1000) {
          label.set("text", "FPS: " + count);
          count = 0;
          start = curTime;
        }

      }
    };
    window.setInterval(render, 0);
  };

  var offset = new Date().getTime() - time;
  label.set("text", 'Load: ' + offset);

  label.on("MouseDown", run);

});
