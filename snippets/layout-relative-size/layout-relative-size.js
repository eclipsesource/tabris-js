var page = tabris.create("Page", {
  title: "Layout - Percentages",
  topLevel: true
});

tabris.create("Composite", {
  layoutData: {left: 10, top: 10, right: 10, bottom: "70%"},
  background: "red"
}).appendTo(page);

tabris.create("Composite", {
  layoutData: {left: 10, top: ["30%", 10], right: 10, bottom: 10},
  background: "blue"
}).appendTo(page);

page.open();
