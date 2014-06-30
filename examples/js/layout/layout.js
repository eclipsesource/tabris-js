/*jshint unused: false */
Tabris.load( function() {

  var white = [255, 255, 255];

  var page = Tabris.createPage({ title: "Client Layout", topLevel: true });

  var emptyLayoutDataLabel = page.append("Label", {
    background: [255, 0, 128],
    text: "Empty layoutData",
    foreground: white,
    layoutData: { }
  });

  var widthHeightLabel = page.append("Label", {
    background: [0, 0, 128],
    text: "Width = 200, Height = 200",
    foreground: white,
    layoutData: { width: 200, height: 200, bottom: 0 }
  });

  page.append("Label", {
    text: "es.png",
    foreground: white,
    image: ["images/es.png", 30, 30],
    layoutData: { width: 30, height: 30, left: [widthHeightLabel, 12] }
  });

  var allMarginsLabel = page.append("Label", {
    background: [0, 128, 128, 40],
    text: "Only margins\nleft: 10, right: 20, top: 200, bottom: 60,",
    layoutData: { left: 10, right: 20, top: 200, bottom: 60 }
  });

  var helloWorldLabel = page.append("Label", {
    background: [255, 128, 128],
    text: "Hello World!",
    foreground: white,
    layoutData: { left: 0, top: 40 }
  });

  var tabrisLabel = page.append("Label", {
    background: [128, 128, 255],
    text: "Tabris",
    foreground: white,
    layoutData: { right: 20, left: [helloWorldLabel, 0], top: [helloWorldLabel, 0] }
  });

  var eclipseSourceLabel = page.append("Label", {
    background: [128, 128, 255],
    text: "EclipseSource",
    foreground: white,
    layoutData: { right: 20, left: [helloWorldLabel, 40], top: [tabrisLabel, 20] }
  });

  var javaLabel = page.append("Label", {
    background: [128, 0, 128],
    foreground: white,
    text: "Java",
    layoutData: { right: 0, top: 10, bottom: [tabrisLabel, 5] }
  });

  var percentageLabel = page.append("Label", {
    background: [128, 0, 128],
    foreground: white,
    text: "Percentage",
    layoutData: { top: 130, right: [30, 0], left: [30, 0] }
  });

  page.open();

});
