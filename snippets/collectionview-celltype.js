new tabris.CollectionView({
  left: 0, top: 0, right: 0, bottom: 0,
  items: createItems(),
  cellType: function(item) {
    return item.type;
  },
  itemHeight: function(item, type) {
    return type === 'section' ? 48 : 24;
  },
  initializeCell: function(cell, type) {
    var textView = new tabris.TextView({
      top: 2, bottom: 2, left: 5, right: 5,
      font: type === 'section' ? 'bold 28px' : '14px',
      alignment: type === 'section' ? 'center' : 'left'
    }).appendTo(cell);
    if (type === 'section') {
      cell.background = '#cecece';
    }
    cell.on('change:item', function(widget, item) {
      textView.text = item.name;
    });
  }
}).appendTo(tabris.ui.contentView);

function createItems() {
  var count = 1;
  var items = [];
  ['Section 1', 'Section 2', 'Section 3'].forEach(function(name) {
    items.push({name: name, type: 'section'});
    for (var i = 0; i < 25; i++) {
      items.push({name: 'Item ' + count++, type: 'item'});
    }
  });
  return items;
}
