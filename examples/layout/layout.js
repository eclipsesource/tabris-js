tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Client Layout",
    topLevel: true
  });

  var emptyLayoutDataLabel = tabris.create("Label", {
    background: "#ff0080",
    text: "Empty layoutData",
    foreground: "white",
    layoutData: {left: 0, top: 0}
  });

  var widthHeightLabel = tabris.create("Label", {
    background: "#ff0080",
    text: "Width = 200, Height = 200",
    foreground: "white",
    layoutData: {left: 0, bottom: 0, width: 200, height: 200}
  });

  var esImage = tabris.create("Label", {
    text: "es.png",
    foreground: "white",
    image: {src: "images/es.png", width: 30, height: 30},
    layoutData: {left: [widthHeightLabel, 12], top: 0, width: 30, height: 30}
  });

  var allMarginsLabel = tabris.create("Label", {
    background: "rgba(0, 128, 128, 0.2)",
    text: "Only margins\nleft: 10, right: 20, top: 200, bottom: 60",
    layoutData: {left: 10, top: 200, right: 20, bottom: 60}
  });

  var helloWorldLabel = tabris.create("Label", {
    background: "#ff8080",
    text: "Hello World!",
    foreground: "white",
    layoutData: {left: 0, top: 40}
  });

  var tabrisLabel = tabris.create("Label", {
    background: "#8080ff",
    text: "tabris",
    foreground: "white",
    layoutData: {left: [helloWorldLabel, 0], top: [helloWorldLabel, 0], right: 20}
  });

  var eclipseSourceLabel = tabris.create("Label", {
    background: "#8080ff",
    text: "EclipseSource",
    foreground: "white",
    layoutData: {left: [helloWorldLabel, 40], top: [tabrisLabel, 20], right: 20}
  });

  var javaLabel = tabris.create("Label", {
    background: "#800080",
    foreground: "white",
    text: "Java",
    layoutData: {top: 10, right: 0, bottom: [tabrisLabel, 5]}
  });

  var percentageLabel = tabris.create("Label", {
    background: "#800080",
    foreground: "white",
    text: "Percentage",
    layoutData: {left: [30, 0], top: 130, right: [30, 0]}
  });

  page.append(emptyLayoutDataLabel, widthHeightLabel, esImage, allMarginsLabel, helloWorldLabel,
    tabrisLabel, eclipseSourceLabel, javaLabel, percentageLabel);

  page.open();

});
