var page = tabris.create("Page", {
  title: "Text Input",
  topLevel: true
});

tabris.create("TextInput", {
  layoutData: {top: 20, left: "20%", right: "20%"},
  message: "Type here, press 'Done'"
}).on("accept", function() {
  tabris.create("TextView", {
    layoutData: {top: [page.children().last(), 20], left: "20%"},
    text: this.get("text")
  }).appendTo(page);
}).appendTo(page);

page.open();
