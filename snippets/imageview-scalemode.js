const MARGIN = 16;
const MARGIN_LARGE = 32;

const IMAGES = [
  {name: 'Large', src: 'images/salad.jpg', scale: 3},
  {name: 'Small', src: 'images/landscape.jpg', scale: 3}
];
const SCALE_MODES = ['auto', 'fit', 'fill', 'stretch', 'none'];

let imageView = new tabris.ImageView({
  top: MARGIN, width: 200, height: 200, centerX: 0,
  image: IMAGES[0],
  background: 'rgb(220, 220, 220)'
}).appendTo(tabris.ui.contentView);

let imageSizeLabel = new tabris.TextView({
  left: MARGIN, top: [imageView, MARGIN_LARGE], width: 96,
  text: 'Image'
}).appendTo(tabris.ui.contentView);

new tabris.Picker({
  right: MARGIN, left: [imageSizeLabel, 0], baseline: imageSizeLabel,
  itemCount: IMAGES.length,
  itemText: index => IMAGES[index].name
}).on({
  select: ({index}) => imageView.image = IMAGES[index]
}).appendTo(tabris.ui.contentView);

let scaleModeTextView = new tabris.TextView({
  left: MARGIN, top: [imageSizeLabel, MARGIN_LARGE], width: 96,
  text: 'Scale mode'
}).appendTo(tabris.ui.contentView);

new tabris.Picker({
  right: MARGIN, left: scaleModeTextView, baseline: scaleModeTextView,
  itemCount: SCALE_MODES.length,
  itemText: index => SCALE_MODES[index]
}).on({
  select: ({index}) => imageView.scaleMode = SCALE_MODES[index]
}).appendTo(tabris.ui.contentView);
