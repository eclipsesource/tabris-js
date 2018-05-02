import {CollectionView, TextView, ImageView, ui} from 'tabris';

let items = [];
for (let section of ['settings-black-24dp@3x.png', 'share-black-24dp@3x.png', 'search-black-24dp@3x.png']) {
  items.push({type: 'section', image: {src: `resources/${section}`, scale: 3}});
  for (let i = 1; i <= 25; i++) {
    items.push({type: 'item', text: `Item ${i}`});
  }
}

new CollectionView({
  left: 0, top: 0, right: 0, bottom: 0,
  itemCount: items.length,
  cellType: index => items[index].type,
  cellHeight: (index, type) => type === 'section' ? 48 : 24,
  createCell: type => type === 'section' ? new ImageView() : new TextView(),
  updateCell: (view, index) => {
    let item = items[index];
    if (item.type === 'section') {
      view.image = item.image;
    } else {
      view.text = item.text;
    }
  }
}).appendTo(ui.contentView);
