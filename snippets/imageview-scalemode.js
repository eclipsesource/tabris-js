var MARGIN = 16;
var MARGIN_LARGE = 32;

var scaleModes = ['auto', 'fit', 'fill', 'stretch', 'none'];

var imageView = new tabris.ImageView({
  top: MARGIN, width: 200, height: 200, centerX: 0,
  image: getImage(0),
  background: 'rgb(220, 220, 220)'
}).appendTo(tabris.ui.contentView);

var imageSizeLabel = new tabris.TextView({
  left: MARGIN, top: [imageView, MARGIN_LARGE], width: 96,
  text: 'Image'
}).appendTo(tabris.ui.contentView);

var imageSizePicker = new tabris.Picker({
  right: MARGIN, left: [imageSizeLabel, 0], baseline: imageSizeLabel,
  items: ['Large', 'Small']
}).appendTo(tabris.ui.contentView);

var scaleModeTextView = new tabris.TextView({
  left: MARGIN, top: [imageSizeLabel, MARGIN_LARGE], width: 96,
  text: 'Scale mode'
}).appendTo(tabris.ui.contentView);

var scaleModePicker = new tabris.Picker({
  right: MARGIN, left: [scaleModeTextView, 0], baseline: scaleModeTextView,
  items: scaleModes
}).appendTo(tabris.ui.contentView);

imageSizePicker.on('change:selectionIndex', function(widget, index) {
  imageView.image = getImage(index);
});

scaleModePicker.on('change:selectionIndex', function(widget, index) {
  imageView.scaleMode = scaleModes[index];
});

function getImage(index) {
  if (index === 0) {
    return {src: 'images/salad.jpg', scale: 3};
  }
  return {src: 'images/landscape.jpg', scale: 3};
}
