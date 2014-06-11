DEBUG = true;
Tabris.load(function() {
	var page = Tabris.createPage({
		title: "Automata",
		topLevel: true
	});
	page.set("background", [0, 0, 0, 255]);
  page.set("bounds", [0,0,320,504]);
	// var bounds = page.get("bounds");

	var label = page.append("rwt.widgets.Label", {
		bounds: [0, 0, 80, 40],
		background: [255, 0, 0, 200],
		foreground: [255, 255, 255, 255],
    text:"FPS"
	});

	// var height = Ti.Platform.displayCaps.platformHeight;
	// var width = Ti.Platform.displayCaps.platformWidth;
	var width = 320;//bounds[2];
	var height = 504; //bounds[3];

	var CELL_SIZE = Math.floor(Math.min(height, width) / 30);
	var xSize = width / CELL_SIZE;
	var ySize = height / CELL_SIZE;
	//var universe = Ti.UI.createWindow({
	//	backgroundColor: '#000',
	//	modal: false,
	//	exitOnClose: true
	//});

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
			var composite = page.append("rwt.widgets.Composite", {
				bounds: [x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE],
				background: [255, 255, 255, 255],
				visibility: alive
			});
			cells[x][y] = {
				// proxy: Ti.UI.createView({
				// 	height: CELL_SIZE,
				// 	width: CELL_SIZE,
				// 	backgroundColor: '#fff',
				// 	top: y*CELL_SIZE,
				// 	left: x*CELL_SIZE,
				// 	touchEnabled: false,
				// 	visible: alive
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
	//	text: 'FPS: ',
	//	color: '#fff',
	//	backgroundColor: '#a00',
	//	height: 40,
	//	width: 80,
	//	top: 0,
	//	left: 0,
	//	textAlign: 'center',
	//	opacity: 0.8
	//});
	//universe.add(label);

	//
	//universe.open();
	page.open();


	if (DEBUG) {
		var lastTime = new Date().getTime(),
			renderTime = 0,
			ctr = 0,
			thisTime;
	}

  var run = function() {
		var x, y, cell;
    while (true) {
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
				thisTime = new Date().getTime();
				renderTime += thisTime - lastTime;
				lastTime = thisTime;

				// Sadly this shows that the "render" time, which consists solely of changing the visible
				// state of the proxies, consumes about 100x as much time as the "generation" step.
				if (++ctr % 10 === 0) {
					// label.text = 'FPS: ' + Math.round(10000.0/(renderTime/ctr))/10;
					label.set("text", 'FPS: ' + Math.round(10000.0 / (renderTime / ctr)) / 10);
					renderTime = ctr = 0;
				}
			}
    }

  }

  label.on( "MouseDown", run );



});
