tabris.create("Drawer").append(tabris.create("PageSelector"));

tabris.create("Page", {
  title: "Creating multiple top level pages",
  topLevel: true
}).open();

// Top level pages can always be accessed in the page selector
// even if they are not openend
tabris.create("Page", {
  title: "Top level page two",
  topLevel: true
});
