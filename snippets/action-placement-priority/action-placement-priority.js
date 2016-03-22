var page = new tabris.Page({
  title: "Actions - Placement",
  topLevel: true
});

var createAction = function(title, imageName, placementPriority) {
  new tabris.Action({
    title: title,
    placementPriority: placementPriority,
    image: {src: "images/" + imageName}
  });
};

createAction("Search", "search.png", "high");
createAction("Share", "share.png", "low");
createAction("Settings", "settings.png", "low");

page.open();
