// Create an action with an image and a selection handler

var navigationView = new tabris.NavigationView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(tabris.ui.contentView);

new tabris.Action({
  title: 'Action',
  image: 'images/share.png'
}).on('select', function() {
  console.log('Action selected.');
}).appendTo(navigationView);
