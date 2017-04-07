const MARGIN = 16;
const MARGIN_SMALL = 8;

let texts = loadInitialLanguage();

new tabris.Picker({
  id: 'langPicker',
  left: MARGIN, top: MARGIN_SMALL, right: MARGIN
}).on('select', ({item: lang, index}) => {
  if (index > 0) {
    this.selectionIndex = 0;
    texts = require(`./${lang}.json`);
    tabris.ui.contentView.apply(texts);
    collectionView.itemCount = texts.items.length;
    collectionView.refresh();
  }
}).appendTo(tabris.ui.contentView);

let collectionView = new tabris.CollectionView({
  left: 0, top: ['#langPicker', MARGIN_SMALL], right: 0, bottom: 0,
  itemCount: texts.items.length,
  cellHeight: 54,
  createCell: () => {
    let cell = new tabris.Composite();
    new tabris.TextView({
      id: 'priceText',
      top: MARGIN_SMALL, right: MARGIN,
      alignment: 'right',
      font: '14px',
      textColor: '#7CB342'
    }).appendTo(cell);
    new tabris.TextView({
      id: 'nameText',
      left: MARGIN, top: MARGIN_SMALL, right: ['#priceText', 0],
      textColor: '#202020',
      font: 'bold 14px'
    }).appendTo(cell);
    new tabris.TextView({
      id: 'descriptionText',
      textColor: '#767676',
      maxLines: 1,
      left: MARGIN, top: ['#nameText', 0], right: ['#priceText', MARGIN]
    }).appendTo(cell);
    new tabris.Composite({
      left: 0, bottom: 0, right: 0, height: 1,
      background: '#e3e3e3'
    }).appendTo(cell);
    return cell;
  },
  updateCell: (view, index) => {
    let item = texts.items[index];
    view.find('#priceText').set('text', item.price);
    view.find('#nameText').set('text', item.name);
    view.find('#descriptionText').set('text', item.description);
  }
}).appendTo(tabris.ui.contentView);

tabris.ui.contentView.apply(texts);

function loadInitialLanguage() {
  let lang = tabris.device.get('language').replace(/-.*/, '');
  try {
    return require('./' + lang + '.json');
  } catch (ex) {
    return require('./en.json');
  }
}
