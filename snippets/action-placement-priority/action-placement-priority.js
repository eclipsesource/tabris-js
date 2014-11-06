tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Actions - Placement",
    topLevel: true
  });

  var createAction = function(title, imageName, placementPriority) {
    tabris.create("Action", {
      title: title,
      placementPriority: placementPriority,
      image: {src: "images/" + imageName}
    });
  };

  createAction("Search", "search.png", "HIGH");
  createAction("Share", "share.png", "LOW");
  createAction("Settings", "settings.png", "LOW");

  page.open();

});
