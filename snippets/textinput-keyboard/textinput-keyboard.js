var page = new tabris.Page({
  title: "Text Input - Keyboard",
  topLevel: true
});

new tabris.TextInput({
  layoutData: {top: 25, left: "20%", right: "20%"},
  message: "default"
}).appendTo(page);

["ascii", "decimal", "number", "numbersAndPunctuation", "phone", "email", "url"].forEach(function(mode) {
  new tabris.TextInput({
    layoutData: {top: "prev() 10", left: "20%", right: "20%"},
    keyboard: mode,
    message: mode
  }).appendTo(page);
});

page.open();
