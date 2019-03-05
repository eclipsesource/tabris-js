import {ImageView, Picker, contentView} from 'tabris';

const COLORS = ['initial', 'red', 'green', 'blue'];

const imageView = new ImageView({
  top: 64, centerX: 0,
  image: {src: 'resources/cloud-check.png', scale: 3}
}).appendTo(contentView);

new Picker({
  top: [imageView, 16], centerX: 0,
  itemCount: COLORS.length,
  itemText: index => COLORS[index]
}).onSelect(({index}) => imageView.tintColor = COLORS[index])
  .appendTo(contentView);
