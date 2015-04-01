var page = tabris.create("Page", {
  title: "Creating a new page dynamically",
  topLevel: true
});

tabris.create("Button", {
  layoutData: {left: 10, top: 10, right: 10},
  text: "Create and open a new page"
}).on("select", function() {
  tabris.create("Page", {
    title: "Dynamically created page"
  }).open();
}).appendTo(page);

page.open();
