const {Cell, CollectionView, TextView, ui} = require('tabris');

class TextCell extends Cell {
  constructor(type) {
    super({
      background: type === 'section' ? '#cecece' : 'white'
    });
    let textView = new TextView({
      top: 2, bottom: 2, left: 5, right: 5,
      font: type === 'section' ? 'bold 28px' : '14px',
      alignment: type === 'section' ? 'center' : 'left'
    }).appendTo(this);
    this.on('itemChanged', ({value: item}) => {
      textView.text = item.name;
    });
  }
}

new CollectionView({
  left: 0, top: 0, right: 0, bottom: 0,
  items: createItems(),
  cellType: item => item.type,
  itemHeight: (item, type) => type === 'section' ? 48 : 24,
  createCell: type => new TextCell(type)
}).appendTo(ui.contentView);

function createItems() {
  let items = [];
  for (let section of ['A', 'B', 'C', 'D']) {
    items.push({name: `Section ${section}`, type: 'section'});
    for (let i = 1; i <= 25; i++) {
      items.push({name: `Item ${section}${i}`, type: 'item'});
    }
  }
  return items;
}
