tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Hello, World!",
    topLevel: true
  });

  var button = tabris.create("Button", {
    text: "Native Widgets",
    layoutData: { centerX: 0, top: 100 }
  }).on("selection", function() {
    label.set("text", "Totally Rock!");
  }).appendTo(page);

  var label = tabris.create("Label", {
    font: "24px",
    layoutData: {centerX: 0, top: [button, 50]}
  }).appendTo(page);

  page.open();

});
