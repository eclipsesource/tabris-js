new tabris.Drawer().append(new tabris.PageSelector());

new tabris.Page({
  title: "Creating multiple top level pages",
  topLevel: true
}).open();

// Top level pages can always be accessed in the page selector
// even if they are not openend
new tabris.Page({
  title: "Top level page two",
  topLevel: true
});
