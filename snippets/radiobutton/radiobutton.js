tabris.load(function() {

  var lastButton;

  var page = tabris.create("Page", {
    title: "Creating radio buttons with selection handlers",
    topLevel: true
  });

  var selectionHadler = function() {
    console.log(this.get("text") + " selected.");
  };

  for (var i = 0; i < 3; i++) {
    lastButton = tabris.create("RadioButton", {
      layoutData: {left: 0, top: [lastButton, 0]},
      text: "Radio button " + (i + 1)
    }).on("change:selection", selectionHadler).appendTo(page);
  }

  page.open();
});
