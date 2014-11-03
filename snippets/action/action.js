tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Creating an action with an image and a selection handler",
    topLevel: true
  });

  tabris.create("Action", {
    title: "Action",
    image: {src: "img/action_search.png"}
  }).on("selection", function() {
    console.log("Action selected.");
  });

  page.open();

});
