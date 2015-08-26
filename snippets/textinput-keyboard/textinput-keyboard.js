var page = tabris.create("Page", {
  title: "Text Input - Keyboard",
  topLevel: true
});

tabris.create("TextInput", {
  layoutData: {top: 25, left: "20%", right: "20%"},
  message: "default"
}).appendTo(page);

["ascii", "decimal", "number", "numbersAndPunctuation", "phone", "email", "url"].forEach(function(mode) {
  tabris.create("TextInput", {
    layoutData: {top: "prev() 10", left: "20%", right: "20%"},
    keyboard: mode,
    message: mode
  }).appendTo(page);
});

page.open();
