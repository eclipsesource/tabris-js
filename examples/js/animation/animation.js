tabris.load(function() {

  var MARGIN = 12;

  var page = tabris.createPage({
    title: "Simple Animation",
    topLevel: true
  });

  var label = page.append("Label", {
    layoutData: {left: MARGIN, top: MARGIN},
    background: "#6aa",
    foreground: "white",
    text: "Hallo World"
  });

  var button = page.append("Button", {
    layoutData: {left: MARGIN, right: MARGIN, top: [label, MARGIN]},
    text: "Animate"
  });

  button.on("Selection", function() {
    tabris.create("tabris.Animation", {
      target: label,
      delay: 0,
      duration: 1000,
      repeat: 1,
      reverse: true,
      easing: "ease-out", // "linear", "ease-in", "ease-out", "ease-in-ou
      properties: {
        opacity: 0.25,
        rotation: 0.75 * Math.PI,
        scaleX: 2.0,
        scaleY: 2.0,
        translationX: 100,
        translationY: 200
      }
    }).on("Completion", function() {
      this.dispose();
    }).call("start");
  });

});
