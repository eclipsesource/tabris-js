var texts = (function() {
  var lang = tabris.device.get('language').replace(/-.*/, '');
  try {
    return require('./' + lang + '.json');
  } catch (ex) {
    return require('./en.json');
  }
}());

var MARGIN = 10;

new tabris.Picker({id: 'langPicker', layoutData: {left: 10, top: 10, right: 10}})
  .on('select', function(widget, selection, options) {
    if (options.index > 0) {
      this.selectionIndex = 0;
      tabris.ui.contentView.apply(require('./' + selection + '.json'));
    }
  }).appendTo(tabris.ui.contentView);

new tabris.CollectionView({
  id: 'menuItemsCV',
  itemHeight: 100,
  layoutData: {left: 0, top: '#langPicker 10', right: 0, bottom: 0},
  initializeCell: function(cell) {
    var price = new tabris.TextView({
      layoutData: {centerY: 0, right: MARGIN, width: 100},
      alignment: 'right',
      font: '18px',
      textColor: '#a4c639'
    }).appendTo(cell);
    var name = new tabris.TextView({
      layoutData: {left: MARGIN, top: MARGIN, right: [price, 0]},
      font: 'bold 18px'
    }).appendTo(cell);
    var description = new tabris.TextView({
      layoutData: {left: MARGIN, top: [name, MARGIN / 2], right: [price, 0]}
    }).appendTo(cell);
    new tabris.Composite({
      layoutData: {left: 0, bottom: 0, right: 0, height: 1},
      background: '#e3e3e3'
    }).appendTo(cell);
    cell.on('change:item', function(widget, item) {
      name.text = item.name;
      description.text = item.description;
      price.text = item.price;
    });
  }
}).appendTo(tabris.ui.contentView);

tabris.ui.contentView.apply(texts);
