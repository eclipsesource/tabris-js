var page = tabris.create("Page", {
  title: "TextView",
  topLevel: true
});

tabris.create("TextView", {
  layoutData: {left: 10, top: 10, right: 10},
  text: "Left",
  alignment: "left"
}).appendTo(page);

tabris.create("TextView", {
  layoutData: {left: 10, top: [page.children().last(), 10], right: 10},
  text: "Center",
  alignment: "center"
}).appendTo(page);

tabris.create("TextView", {
  layoutData: {left: 10, top: [page.children().last(), 10], right: 10},
  text: "Right",
  alignment: "right"
}).appendTo(page);

page.open();
