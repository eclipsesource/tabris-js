import {TextView, CollectionView, Slider, contentView} from 'tabris';

const columnCountTextView = new TextView({
  bottom: 16, right: 16, width: 32,
  font: 'bold 14px'
}).appendTo(contentView);

const slider = new Slider({
  left: 16, bottom: 0, right: [columnCountTextView, 16], height: 48,
  minimum: 1,
  maximum: 8
}).onSelectionChanged(({value: selection}) => {
  collectionView.columnCount = selection;
  columnCountTextView.text = `${selection}`;
}).appendTo(contentView);

const items = createItems();

const collectionView = new CollectionView({
  left: 0, top: 0, right: 0, bottom: slider,
  itemCount: items.length,
  cellHeight: 128,
  createCell: () => new TextView({
    font: 'bold 32px',
    textColor: '#555555',
    alignment: 'center',
    maxLines: 1
  }),
  updateCell: (cell, index) => {
    cell.set({
      text: `${items[index]}`,
      background: index % 2 === 0 ? '#CFD8DC' : '#ffffff'
    });
  }
}).appendTo(contentView);

slider.selection = 3;

function createItems() {
  const result = [];
  for (let i = 1; i <= 100; i++) {
    result.push(i);
  }
  return result;
}
