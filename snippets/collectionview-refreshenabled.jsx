import {CollectionView, TextView, contentView} from 'tabris';

/** @type {string[]} */
const items = [];

contentView.append(
  <CollectionView stretch refreshEnabled
      cellHeight={25}
      createCell={() => new TextView()}
      updateCell={(cell, index) => cell.text = items[index]}
      onRefresh={refresh}/>
);

refresh().catch(ex => console.error(ex));

async function refresh() {
  const cv = $(CollectionView).only();
  cv.set({refreshIndicator: true, refreshMessage: 'loading...'});
  await new Promise(resolve => setTimeout(resolve, 1000));
  for (let i = 0; i < 25; i++) {
    items.unshift('Item ' + ++items.length);
  }
  cv.insert(0, 25);
  cv.set({refreshIndicator: false, refreshMessage: ''});
}
