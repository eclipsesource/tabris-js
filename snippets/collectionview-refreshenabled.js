var view = new tabris.CollectionView({
  left: 0, top: 0, right: 0, bottom: 0,
  itemHeight: 25,
  refreshEnabled: true,
  initializeCell: function(cell) {
    var textView = new tabris.TextView({
      top: 2, bottom: 2, left: 5, right: 5
    }).appendTo(cell);
    cell.on('itemChanged', function({value: item}) {
      textView.text = item;
    });
  }
}).on('refresh', function() {
  loadItems();
}).appendTo(tabris.ui.contentView);

loadItems();

function loadItems() {
  view.refreshIndicator = true;
  view.refreshMessage = 'loading...';
  setTimeout(function() {
    view.items = createNewItems();
    view.refreshIndicator = false;
    view.refreshMessage = '';
  }, 1000);
}

var count = 1;
function createNewItems() {
  var items = [];
  for (var i = 0; i < 25; i++) {
    items.push('Item ' + count++);
  }
  return items;
}
