tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Developer Console",
    topLevel: true
  });

  var logText = tabris.create("Text", {
    layoutData: {left: 10, top: 20, right: 10},
    text: "Message",
    message: "Log message"
  }).appendTo(page);

  ["debug", "log", "info", "warn", "error"].forEach(function(method) {
    tabris.create("Button", {
      layoutData: {left: 10, right: 10, top: [page.children().pop(), 10]},
      text: method
    }).on("selection", function() {
      console[method](logText.get("text"));
    }).appendTo(page);
  });

  page.open();

});
