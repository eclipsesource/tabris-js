var page = new tabris.Page({
  title: "Radio Buttons",
  topLevel: true
});

["One", "Two", "Three"].forEach(function(title) {
  new tabris.RadioButton({
    layoutData: {left: 10, top: "prev() 10"},
    text: title
  }).on("change:selection", function(widget, selection) {
    if (selection) {
      console.log(widget.get("text") + " selected");
    }
  }).appendTo(page);
});

page.open();
