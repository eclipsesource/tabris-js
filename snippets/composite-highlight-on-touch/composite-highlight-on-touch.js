var page = tabris.create("Page", {
  title: "Composite highlighted on touch",
  topLevel: true
});

tabris.create("Composite", {
  layoutData: {left: [30, 0], top: [30, 0], right: [30, 0], bottom: [30, 0]},
  highlightOnTouch: true,
  background: "gray"
}).appendTo(page);

page.open();
