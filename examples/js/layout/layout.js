/*jshint unused: false */
var white = [255, 255, 255];

var page = Tabris.createPage("Client Layout", true);

Tabris.createPage("Empty Page", true);

page.open();

var emptyLayoutDataLabel = page.append("rwt.widgets.Label", {
  background: [255, 0, 128],
  text: "Empty layoutData",
  foreground: white,
  layoutData: {
    // empty layout data
  }
});

var withHeightLabel = page.append("rwt.widgets.Label", {
  background: [0, 0, 128],
  text: "Width = 200, Height = 200",
  foreground: white,
  layoutData: {
    width: 200,
    height: 200,
    bottom: 0
  }
});

var allMarginsLabel = page.append("rwt.widgets.Label", {
  background: [0, 128, 128, 40],
  text: "Only margins\nleft: 10, right: 20, top: 200, bottom: 60,",
  layoutData: {
    left: 10,
    right: 20,
    top: 200,
    bottom: 60
  }
});

var helloWorldLabel = page.append("rwt.widgets.Label", {
  background: [255, 128, 128],
  text: "Hello World!",
  foreground: white,
  layoutData: {
    left: 0,
    top: 40
  }
});

var tabrisLabel = page.append("rwt.widgets.Label", {
  background: [128, 128, 255],
  text: "Tabris",
  foreground: white,
  layoutData: {
    right: 20,
    left: [helloWorldLabel, 0],
    top: [helloWorldLabel, 0]
  }
});

var eclipseSourceLabel = page.append("rwt.widgets.Label", {
  background: [128, 128, 255],
  text: "EclipseSource",
  foreground: white,
  layoutData: {
    right: 20,
    left: [helloWorldLabel, 40],
    top: [tabrisLabel, 20]
  }
});

var javaLabel = page.append("rwt.widgets.Label", {
  background: [128, 0, 128],
  foreground: white,
  text: "Java",
  layoutData: {
    right: 0,
    top: 10,
    bottom: [tabrisLabel, 5]
  }
});

var javaLabel = page.append("rwt.widgets.Label", {
  background: [128, 0, 128],
  foreground: white,
  text: "Percentage",
  layoutData: {
    top: 130,
    right: [30, 0],
    left: [30, 0]
  }
});
