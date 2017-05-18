const {ImageView, ui} = require('tabris');

// Display images with different scale modes

createImageView('fit');
createImageView('none');
createImageView('fill');

function createImageView(scaleMode) {
  new ImageView({
    left: 10, top: 'prev() 10', width: 250, height: 100,
    image: 'images/target_200.png',
    background: '#aaaaaa',
    scaleMode: scaleMode
  }).appendTo(ui.contentView);
}
