var page = tabris.create("Page", {
  title: "Text Input",
  topLevel: true
});

tabris.create("TextInput", {
  layoutData: {top: 20, left: "20%", right: "20%"},
  message: "Type here, then confirm"
}).on("accept", function(widget, text) {
  tabris.create("TextView", {
    layoutData: {top: [page.children().last(), 20], left: "20%"},
    text: text
  }).appendTo(page);
}).appendTo(page);

page.open();
