var imageView = new tabris.ImageView({
  layoutData: {left: 20, top: 20, width: 100, height: 250},
  image: {src: 'images/target_200.png'},
  background: '#aaaaaa',
  scaleMode: 'auto'
}).appendTo(tabris.ui.contentView);

new tabris.Slider({
  layoutData: {left: 20, top: [imageView, 20], right: 100},
  minimum: 50,
  selection: 100,
  maximum: 300
}).on('change:selection', function(slider, selection) {
  imageView.set('layoutData', {left: 20, top: 20, width: selection, height: 250});
}).appendTo(tabris.ui.contentView);
