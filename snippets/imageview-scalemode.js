import {ImageView, Picker, TextView, ui} from 'tabris';

const MARGIN = 16;
const MARGIN_LARGE = 32;

const IMAGES = [
  {name: 'Large', src: 'resources/salad.jpg', scale: 3},
  {name: 'Small', src: 'resources/landscape.jpg', scale: 3}
];
const SCALE_MODES = ['auto', 'fit', 'fill', 'stretch', 'none'];

const imageView = new ImageView({
  top: MARGIN, width: 200, height: 200, centerX: 0,
  image: IMAGES[0],
  background: 'rgb(220, 220, 220)'
}).appendTo(ui.contentView);

const imageSizeLabel = new TextView({
  left: MARGIN, top: [imageView, MARGIN_LARGE], width: 96,
  text: 'Image'
}).appendTo(ui.contentView);

new Picker({
  right: MARGIN, left: [imageSizeLabel, 0], baseline: imageSizeLabel,
  itemCount: IMAGES.length,
  itemText: index => IMAGES[index].name
}).on({
  select: ({index}) => imageView.image = IMAGES[index]
}).appendTo(ui.contentView);

const scaleModeTextView = new TextView({
  left: MARGIN, top: [imageSizeLabel, MARGIN_LARGE], width: 96,
  text: 'Scale mode'
}).appendTo(ui.contentView);

new Picker({
  right: MARGIN, left: scaleModeTextView, baseline: scaleModeTextView,
  itemCount: SCALE_MODES.length,
  itemText: index => SCALE_MODES[index]
}).on({
  select: ({index}) => imageView.scaleMode = SCALE_MODES[index]
}).appendTo(ui.contentView);
