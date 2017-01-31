
var navigationView = new tabris.NavigationView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(tabris.ui.contentView);

var createAction = function(title, imageName, placementPriority) {
  new tabris.Action({
    title: title,
    placementPriority: placementPriority,
    image: 'images/' + imageName
  }).appendTo(navigationView);
};

createAction('Search', 'search.png', 'high');
createAction('Share', 'share.png', 'low');
createAction('Settings', 'settings.png', 'normal');
