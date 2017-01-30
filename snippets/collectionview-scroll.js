var SECTION_HEIGHT = 48;
var ITEM_HEIGHT = 32;

var scrollPosition = 0;
var items = createItems();

var floatingSection = createSectionView('section');
floatingSection.text = 'Section 1';

new tabris.CollectionView({
  left: 0, top: 0, right: 0, bottom: 0,
  items: items,
  cellType: function(item) {
    return item.type;
  },
  itemHeight: function(item, type) {
    return type === 'section' ? SECTION_HEIGHT : ITEM_HEIGHT;
  },
  initializeCell: function(cell, type) {
    var textView = type === 'section' ? createSectionView() : createItemView();
    textView.appendTo(cell);
    cell.on('change:item', function(widget, item) {
      textView.text = item.name;
    });
  }
}).on('scroll', function(collectionView, event) {
  scrollPosition += event.deltaY;
  var firstVisibleItem = collectionView.firstVisibleIndex;
  floatingSection.set({
    text: getCurrentSection(firstVisibleItem).name,
    transform: {translationY: getSectionTranslationY(firstVisibleItem)}
  });
}).appendTo(tabris.ui.contentView);

floatingSection.appendTo(tabris.ui.contentView);

function getSectionTranslationY(firstVisibleItem) {
  if (scrollPosition < 0) {
    return -scrollPosition;
  }
  var nextSectionOffset = scrollPosition + SECTION_HEIGHT - getNextSection(firstVisibleItem).top;
  if (nextSectionOffset > 0) {
    return -nextSectionOffset;
  }
  return 0;
}

function getNextSection(firstVisibleItem) {
  for (var i = firstVisibleItem + 1; i < items.length; i++) {
    var item = items[i];
    if (item.type === 'section') {
      return item;
    }
  }
  return null;
}

function getCurrentSection(firstVisibleItem) {
  for (var i = firstVisibleItem; i >= 0; i--) {
    var item = items[i];
    if (item.type === 'section') {
      return item;
    }
  }
  return null;
}

function createSectionView() {
  return new tabris.TextView({
    top: 0, height: SECTION_HEIGHT, left: 0, right: 0,
    background: '#aaaaaa',
    textColor: 'white',
    font: 'bold 24px',
    alignment: 'center'
  });
}

function createItemView() {
  return new tabris.TextView({
    top: 2, bottom: 2, left: 5, right: 5,
    font: '14px',
    alignment: 'left'
  });
}

function createItems() {
  var count = 1;
  var items = [];
  var top = 0;
  for (var j = 1; j <= 10; j++) {
    items.push({name: 'Section ' + j, type: 'section', top: top});
    top += SECTION_HEIGHT;
    for (var i = 0; i < 5; i++) {
      items.push({name: 'Item ' + count++, type: 'item', top: top});
      top += ITEM_HEIGHT;
    }
  }
  return items;
}
