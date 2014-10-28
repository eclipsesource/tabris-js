tabris.load(function() {
  var page = tabris.create("Page", {
    title: "Creating text widgets with set message and focus handlers",
    topLevel: true
  });

  var text1 = tabris.create("Text", {
    layoutData: {left: 0, top: 0},
    message: "Text 1"
  }).appendTo(page);

  var text2 = tabris.create("Text", {
    layoutData: {left: 0, top: [text1, 15]},
    message: "Text 2"
  }).appendTo(page);

  [text1, text2].forEach(function(text) {
    text.on("focus", function() {
      console.log(this.get("message") + " is focused.");
    });
    text.on("blur", function() {
      console.log(this.get("message") + " lost focus.");
    });
  });

  page.open();
});
