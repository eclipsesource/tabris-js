tabris.load(function() {

  tabris.create("Page", {
    title: "Creating multiple level pages",
    topLevel: true
  }).open();

  // Top level pages can always be accessed in the page selector
  // even if they are not openend
  tabris.create("Page", {
    title: "Top level page two",
    topLevel: true
  });

});
