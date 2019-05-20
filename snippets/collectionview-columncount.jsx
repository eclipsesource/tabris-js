import {TextView, CollectionView, Slider, contentView} from 'tabris';

const items = createItems();

contentView.append(
  <$>
    <CollectionView stretchX top bottom='next()'
        columnCount={3}
        cellHeight={128}
        itemCount={items.length}
        createCell={createCell}
        updateCell={updateCell}/>
    <Slider left={15} bottom={0} right='next()' height={48}
        minimum={1}
        maximum={8}
        selection={3}
        onSelectionChanged={updateColumnCount}/>
    <TextView id='label' bottom={16} right={24} width={24} font='bold 14px' alignment='right' text='3'/>
  </$>
);

function createCell() {
  return new TextView({
    font: {size: 32, weight: 'bold'},
    textColor: '#555555',
    alignment: 'centerX',
    maxLines: 1
  });
}

/**
 * @param {TextView} cell
 * @param {number} index
 */
function updateCell(cell, index) {
  cell.text = `${items[index]}`;
  cell.background = index % 2 === 0 ? '#cfd8dc' : '#ffffff';
}

function updateColumnCount() {
  const columnCount = $(Slider).only().selection;
  $(CollectionView).only().columnCount = columnCount;
  $('#label').only(TextView).text = `${columnCount}`;
}

function createItems() {
  const result = [];
  for (let i = 1; i <= 100; i++) {
    result.push(i);
  }
  return result;
}
