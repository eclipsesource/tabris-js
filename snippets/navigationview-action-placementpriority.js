var navigationView = new tabris.NavigationView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(tabris.ui.contentView);

var createAction = function(title, image, placementPriority) {
  new tabris.Action({
    title: title,
    placementPriority: placementPriority,
    image: {src: image, scale: 3}
  }).appendTo(navigationView);
};

function getImage(image) {
  return 'images/' + image + (tabris.device.platform === 'iOS' ? '-black-24dp@3x.png' : '-white-24dp@3x.png');
}

createAction('Search', getImage('search'), 'high');
createAction('Share', getImage('share'), 'normal');
createAction('Settings', getImage('settings'), 'low');
