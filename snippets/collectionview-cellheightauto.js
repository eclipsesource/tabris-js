const {TextView, ImageView, Composite, CollectionView, ui} = require('tabris');

const MARGIN = 16;
const TEXT = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem' +
  ' accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab' +
  ' illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.' +
  ' Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,' +
  ' sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.' +
  ' Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur,' +
  ' adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et' +
  ' dolore magnam aliquam quaerat voluptatem.';

const items = [];

for (let i = 0; i < 30; i++) {
  items[i] = TEXT.substring(0, (i + 1) * 50);
}

new CollectionView({
  left: 0, top: 0, right: 0, bottom: 0,
  itemCount: items.length,
  createCell: () => {
    const composite = new Composite();
    new ImageView({
      id: 'imageView',
      left: MARGIN, top: MARGIN,
      image: {src: 'resources/arrow-forward-black-24dp@3x.png', scale: 3}
    }).appendTo(composite);
    new TextView({
      id: 'textView',
      left: ['#imageView', MARGIN], top: MARGIN, right: MARGIN
    }).appendTo(composite);
    return composite;
  },
  updateCell: (cell, index) => cell.find('#textView').set({text: items[index]})
}).appendTo(ui.contentView);
