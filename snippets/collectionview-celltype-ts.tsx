import { CollectionView, TextView, ImageView, contentView, ImageValue } from 'tabris';

type Section = {type: 'section', image: ImageValue};
type Item = {type: 'item', text: string};

const items = createItems();

contentView.append(
  <CollectionView stretch
      itemCount={items.length}
      cellType={index => items[index].type}
      cellHeight={(_, type) => type === 'section' ? 48 : 24}
      createCell={type => type === 'section' ? new ImageView() : new TextView()}
      updateCell={updateCell}/>
);

function updateCell(cell: ImageView | TextView, index: number) {
  const item = items[index];
  if (cell instanceof ImageView && item.type === 'section') {
    cell.image = item.image;
  } else if (cell instanceof TextView && item.type === 'item') {
    cell.text = item.text;
  }
}

function createItems() {
  const result: Array<Item | Section> = [];
  for (const section of ['settings-black-24dp@3x.png', 'share-black-24dp@3x.png', 'search-black-24dp@3x.png']) {
    result.push({type: 'section', image: `resources/${section}`});
    for (let i = 1; i <= 25; i++) {
      result.push({type: 'item', text: `Item ${i}`});
    }
  }
  return result;
}
