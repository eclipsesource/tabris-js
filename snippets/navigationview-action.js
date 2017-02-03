// Create an action with an image and a selection handler

var navigationView = new tabris.NavigationView({
  left: 0, top: 0, right: 0, bottom: 0,
  background: '#e7e7e7'
}).appendTo(tabris.ui.contentView);

new tabris.Action({
  title: 'Action',
  image: {
    src: tabris.device.platform === 'iOS' ? 'images/share-black-24dp@3x.png' : 'images/share-white-24dp@3x.png',
    scale: 3
  }
}).on('select', function() {
  console.log('Action selected.');
}).appendTo(navigationView);
