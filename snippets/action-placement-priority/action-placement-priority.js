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

createAction("Search", "search.png", "high");
createAction("Share", "share.png", "low");
createAction("Settings", "settings.png", "low");

page.open();
