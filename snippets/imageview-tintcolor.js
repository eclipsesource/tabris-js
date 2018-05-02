import {ImageView, Picker, ui} from 'tabris';

const COLORS = ['initial', 'red', 'green', 'blue'];

let imageView = new ImageView({
  top: 64, centerX: 0,
  image: {src: 'resources/cloud-check.png', scale: 3}
}).appendTo(ui.contentView);

new Picker({
  top: [imageView, 16], centerX: 0,
  itemCount: COLORS.length,
  itemText: index => COLORS[index]
}).on({
  select: ({index}) => imageView.tintColor = COLORS[index]
}).appendTo(ui.contentView);
