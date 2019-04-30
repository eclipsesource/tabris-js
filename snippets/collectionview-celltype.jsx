import {CollectionView, TextView, ImageView, contentView} from 'tabris';

const items = createItems();

contentView.append(
  <CollectionView stretch
      itemCount={items.length}
      cellType={index => items[index].type}
      cellHeight={(_index, type) => type === 'section' ? 48 : 24}
      createCell={type => type === 'section' ? new ImageView() : new TextView()}
      updateCell={updateCell}/>
);

/**
 * @param {ImageView|TextView} cell
 * @param {number} index
 */
function updateCell(cell, index) {
  if (cell instanceof ImageView) {
    cell.image = items[index].image;
  } else {
    cell.text = items[index].text;
  }
}

function createItems() {
  const result = [];
  for (const section of ['settings-black-24dp@3x.png', 'share-black-24dp@3x.png', 'search-black-24dp@3x.png']) {
    result.push({type: 'section', image: `resources/${section}`});
    for (let i = 1; i <= 25; i++) {
      result.push({type: 'item', text: `Item ${i}`});
    }
  }
  return result;
}
