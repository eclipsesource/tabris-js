var page = tabris.create("Page", {
  title: "Radio Buttons",
  topLevel: true
});

["One", "Two", "Three"].forEach(function(title) {
  tabris.create("RadioButton", {
    layoutData: {left: 10, top: [page.children().last(), 10]},
    text: title
  }).on("change:selection", function(widget, selection) {
    if (selection) {
      console.log(widget.get("text") + " selected");
    }
  }).appendTo(page);
});

page.open();
