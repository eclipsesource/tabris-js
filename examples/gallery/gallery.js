var imageNames = require('./images/index.json');

tabris.ui.contentView.background = 'black';

var navigationView = new tabris.NavigationView({
  left: 0, top: 0, right: 0, bottom: 0,
}).appendTo(tabris.ui.contentView);

var fullImage = new tabris.ImageView({
  top: 0, bottom: 0, left: 0, right: 0,
  image: {src: 'images/' + imageNames[0] + '.jpg'},
  scaleMode: 'auto'
}).appendTo(tabris.ui.contentView);

var scrollView = new tabris.ScrollView({
  left: 0, right: 0, bottom: 0, height: 164,
  direction: 'horizontal',
  background: 'rgba(32, 32, 32, 0.6)'
}).appendTo(tabris.ui.contentView);

imageNames.forEach(function(image, index) {
  new tabris.ImageView({
    top: 7, left: index * 157, width: 150, height: 150,
    image: {src: 'images/' + image + '_thumb.jpg', width: 150, height: 150},
    highlightOnTouch: true
  }).on('tap', function() {
    fullImage.image = {src: 'images/' + image + '.jpg'};
  }).appendTo(scrollView);
});

var fullscreenAction = new tabris.Action({
  title: 'Fullscreen',
  placementPriority: 'high'
}).on('select', toggleAction)
  .appendTo(navigationView);

var thumbnailsAction = new tabris.Action({
  title: 'Thumbnails',
  placementPriority: 'high',
  visible: false
}).on('select', toggleAction)
  .appendTo(navigationView);

function toggleAction() {
  var wasFullscreen = !scrollView.visible;
  scrollView.visible = wasFullscreen;
  thumbnailsAction.visible = !wasFullscreen;
  fullscreenAction.visible = wasFullscreen;
}
