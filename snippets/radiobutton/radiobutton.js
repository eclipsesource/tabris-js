var page = tabris.create("Page", {
  title: "Radio Buttons",
  topLevel: true
});

["One", "Two", "Three"].forEach(function(title) {
  tabris.create("RadioButton", {
    layoutData: {left: 10, top: [page.children().last(), 10]},
    text: title
  }).on("change:selection", function() {
    console.log(this.get("text") + " selected");
  }).appendTo(page);
});

page.open();
