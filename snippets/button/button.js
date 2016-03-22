var page = new tabris.Page({
  title: "Push Buttons",
  topLevel: true
});

var count = 0;

new tabris.Button({
  layoutData: {left: 10, top: 10},
  text: "Button"
}).on("select", function() {
  this.set("text", "Pressed " + (++count) + " times");
}).appendTo(page);

page.open();
