tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Push Buttons",
    topLevel: true
  });

  var count = 0;

  tabris.create("Button", {
    layoutData: {left: 10, top: 10},
    text: "Button"
  }).on("selection", function() {
    this.set("text", "Pressed " + (++count) + " times");
  }).appendTo(page);

  page.open();

});
