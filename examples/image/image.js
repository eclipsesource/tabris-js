const MARGIN = 16;
const MARGIN_LARGE = 32;

const IMAGES = [{
  name: 'Large',
  image: {src: 'images/salad.jpg', scale: 3}
},{
  name: 'Small',
  image: {src: 'images/landscape.jpg', scale: 3}
}];
const SCALE_MODES = ['auto', 'fit', 'fill', 'stretch', 'none'];

let imageView = new tabris.ImageView({
  top: MARGIN, width: 200, height: 200, centerX: 0,
  image: IMAGES[0].image,
  background: 'rgb(220, 220, 220)'
}).appendTo(tabris.ui.contentView);

new tabris.TextView({
  left: MARGIN, top: [imageView, MARGIN_LARGE], width: 96,
  id: 'imageSizeLabel',
  text: 'Image'
}).appendTo(tabris.ui.contentView);

new tabris.Picker({
  right: MARGIN, left: '#imageSizeLabel', baseline: '#imageSizeLabel',
  itemCount: IMAGES.length,
  itemText: index => IMAGES[index].name
}).on('selectionIndexChanged', ({value: index}) => {
  imageView.image = IMAGES[index].image;
}).appendTo(tabris.ui.contentView);

new tabris.TextView({
  left: MARGIN, top: ['#imageSizeLabel', MARGIN_LARGE], width: 96,
  id: 'scaleModeLabel',
  text: 'Scale mode'
}).appendTo(tabris.ui.contentView);

new tabris.Picker({
  right: MARGIN, left: '#scaleModeLabel', baseline: '#scaleModeLabel',
  itemCount: SCALE_MODES.length,
  itemText: index => SCALE_MODES[index]
}).on('selectionIndexChanged', ({value: index}) => {
  imageView.scaleMode = SCALE_MODES[index];
}).appendTo(tabris.ui.contentView);
