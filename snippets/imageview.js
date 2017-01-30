// Display images with different scale modes

var createImageView = function(scaleMode) {
  new tabris.ImageView({
    left: 10, top: 'prev() 10', width: 250, height: 100,
    image: {src: 'images/target_200.png'},
    background: '#aaaaaa',
    scaleMode: scaleMode
  }).appendTo(tabris.ui.contentView);
};

createImageView('fit');
createImageView('none');
createImageView('fill');
