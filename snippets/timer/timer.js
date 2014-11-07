tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Timer",
    topLevel: true
  });

  tabris.create("Button", {
    layoutData: {centerX: 0, centerY: 0},
    text: "Press me!"
  }).on("selection", function() {
    this.set("text", "Please wait...");
    setTimeout(function() {
      this.set("text", "Thank you!");
    }.bind(this), 2000);
  }).appendTo(page);

  page.open();

});
