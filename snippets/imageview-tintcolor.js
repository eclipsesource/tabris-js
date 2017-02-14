var colors = ['initial', 'red', 'green', 'blue'];

var imageView = new tabris.ImageView({
  top: 64, centerX: 0,
  image: {src: 'images/cloud-check.png', scale: 3}
}).appendTo(tabris.ui.contentView);

new tabris.Picker({
  top: [imageView, 16], centerX: 0,
  items: colors
}).on('change:selection', function({value: color}) {
  imageView.tintColor = color;
}).appendTo(tabris.ui.contentView);
