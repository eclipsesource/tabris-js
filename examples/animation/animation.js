var MARGIN = 12;

var page = tabris.create("Page", {
  title: "Simple Animation",
  topLevel: true
});

var button = tabris.create("Button", {
  text: "Animate"
}).appendTo(page);

var label = tabris.create("TextView", {
  layoutData: {left: MARGIN, top: MARGIN},
  background: "#6aa",
  foreground: "white",
  text: "Hello World!"
}).appendTo(page);

button.set("layoutData", {left: MARGIN, right: MARGIN, top: [label, MARGIN]});

button.on("selection", function() {
  label.animate({
    opacity: 0.25,
    transform: {
      rotation: 0.75 * Math.PI,
      scaleX: 2.0,
      scaleY: 2.0,
      translationX: 100,
      translationY: 200
    }
  },
  {
    delay: 0,
    duration: 1000,
    repeat: 1,
    reverse: true,
    easing: "ease-out" // "linear", "ease-in", "ease-out", "ease-in-out"
  });
});
