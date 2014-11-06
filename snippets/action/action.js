tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Actions",
    topLevel: true
  });

  tabris.create("Action", {
    title: "Action",
    image: {src: "images/action_search.png"}
  }).on("selection", function() {
    console.log("Action selected.");
  });

  page.open();

});
