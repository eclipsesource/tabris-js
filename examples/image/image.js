var MARGIN = 16;
var MARGIN_LARGE = 32;

var scaleModes = ['auto', 'fit', 'fill', 'stretch', 'none'];

var imageView = new tabris.ImageView({
  top: MARGIN, width: 200, height: 200, centerX: 0,
  image: getImage(0),
  background: 'rgb(220, 220, 220)'
}).appendTo(tabris.ui.contentView);

new tabris.TextView({
  left: MARGIN, top: [imageView, MARGIN_LARGE], width: 96,
  id: 'imageSizeLabel',
  text: 'Image'
}).appendTo(tabris.ui.contentView);

new tabris.Picker({
  right: MARGIN, left: '#imageSizeLabel', baseline: '#imageSizeLabel',
  items: ['Large', 'Small']
}).on('change:selectionIndex', function(picker, index) {
  imageView.image = getImage(index);
}).appendTo(tabris.ui.contentView);

new tabris.TextView({
  left: MARGIN, top: ['#imageSizeLabel', MARGIN_LARGE], width: 96,
  id: 'scaleModeLabel',
  text: 'Scale mode'
}).appendTo(tabris.ui.contentView);

new tabris.Picker({
  right: MARGIN, left: '#scaleModeLabel', baseline: '#scaleModeLabel',
  items: scaleModes
}).on('change:selectionIndex', function(picker, index) {
  imageView.scaleMode = scaleModes[index];
}).appendTo(tabris.ui.contentView);

function getImage(index) {
  return index === 0 ? {src: 'images/salad.jpg', scale: 3} :  {src: 'images/landscape.jpg', scale: 3};
}
