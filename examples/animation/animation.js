var MARGIN = 12;

var page = new tabris.Page({
  title: "Simple Animation",
  topLevel: true
});

new tabris.Button({
  id: "animateButton",
  text: "Animate",
  layoutData: {left: MARGIN, right: MARGIN, top: MARGIN}
}).on("select", function(button) {
  button.set("enabled", false);
  page.children("#helloLabel").first().animate({
    opacity: 0.25,
    transform: {
      rotation: 0.75 * Math.PI,
      scaleX: 2.0,
      scaleY: 2.0,
      translationX: 100,
      translationY: 200
    }
  }, {
    delay: 0,
    duration: 1000,
    repeat: 1,
    reverse: true,
    easing: "ease-out" // "linear", "ease-in", "ease-out", "ease-in-out"
  }).then(function() {
    button.set("enabled", true);
  });
}).appendTo(page);

new tabris.TextView({
  id: "helloLabel",
  layoutData: {left: MARGIN, top: ["#animateButton", MARGIN]},
  background: "#6aa",
  textColor: "white",
  font: "20px",
  text: "Hello World!"
}).appendTo(page);

module.exports = page;
