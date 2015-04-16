var MARGIN = 12;

var page = tabris.create("Page", {
  title: "Simple Animation",
  topLevel: true
});

tabris.create("Button", {
  text: "Animate",
  layoutData: {left: MARGIN, right: MARGIN, top: ["#hello", MARGIN]}
}).on("select", function(button) {
  button.set("enabled", false);
  page.children("#hello").animate({
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
  }).on("animationend", function() {
    button.set("enabled", true);
  });
}).appendTo(page);

tabris.create("TextView", {
  id: "hello",
  layoutData: {left: MARGIN, top: MARGIN},
  background: "#6aa",
  textColor: "white",
  text: "Hello World!"
}).appendTo(page);

module.exports = page;
