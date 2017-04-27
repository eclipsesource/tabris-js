const COLORS = ['initial', 'red', 'green', 'blue'];

let imageView = new tabris.ImageView({
  top: 64, centerX: 0,
  image: {src: 'images/cloud-check.png', scale: 3}
}).appendTo(tabris.ui.contentView);

new tabris.Picker({
  top: [imageView, 16], centerX: 0,
  itemCount: COLORS.length,
  itemText: index => COLORS[index]
}).on({
  select: ({index}) => imageView.tintColor = COLORS[index]
}).appendTo(tabris.ui.contentView);
