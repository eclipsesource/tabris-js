let SECTION_HEIGHT = 48;
let ITEM_HEIGHT = 32;

let scrollPosition = 0;
let items = createItems();

let floatingSection = createSectionView('section');
floatingSection.text = 'Section 1';

new tabris.CollectionView({
  left: 0, top: 0, right: 0, bottom: 0,
  itemCount: items.length,
  cellType: index => items[index].type,
  cellHeight: (index, type) => type === 'section' ? SECTION_HEIGHT : ITEM_HEIGHT,
  createCell: (type) => type === 'section' ? createSectionView() : createItemView(),
  updateCell: (cell, index) => cell.text = items[index].name
}).on('scroll', ({target, deltaY}) => {
  scrollPosition += deltaY;
  let firstVisibleItem = target.firstVisibleIndex;
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
  let nextSectionOffset = scrollPosition + SECTION_HEIGHT - getNextSection(firstVisibleItem).top;
  if (nextSectionOffset > 0) {
    return -nextSectionOffset;
  }
  return 0;
}

function getNextSection(firstVisibleItem) {
  for (let i = firstVisibleItem + 1; i < items.length; i++) {
    let item = items[i];
    if (item.type === 'section') {
      return item;
    }
  }
  return null;
}

function getCurrentSection(firstVisibleItem) {
  for (let i = firstVisibleItem; i >= 0; i--) {
    let item = items[i];
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
  let count = 1;
  let items = [];
  let top = 0;
  for (let j = 1; j <= 10; j++) {
    items.push({name: 'Section ' + j, type: 'section', top: top});
    top += SECTION_HEIGHT;
    for (let i = 0; i < 5; i++) {
      items.push({name: 'Item ' + count++, type: 'item', top: top});
      top += ITEM_HEIGHT;
    }
  }
  return items;
}
