const MARGIN = 16;
const MARGIN_SMALL = 8;

const LANGUAGES = [{
  id: 'en',
  name: 'English'
}, {
  id: 'de',
  name: 'Deutsch'
}];
let selectedLanguage, texts;

loadLanguage(tabris.device.language);

new tabris.Picker({
  left: MARGIN, top: MARGIN_SMALL, right: MARGIN,
  itemCount: LANGUAGES.length,
  itemText: index => LANGUAGES[index].name,
  selectionIndex: LANGUAGES.map(element => element.id).indexOf(selectedLanguage)
}).on('select', ({index}) => {
  loadLanguage(LANGUAGES[index].id);
  collectionView.itemCount = texts.items.length;
  collectionView.refresh();
}).appendTo(tabris.ui.contentView);

let collectionView = new tabris.CollectionView({
  left: 0, top: ['prev()', MARGIN_SMALL], right: 0, bottom: 0,
  itemCount: texts.items.length,
  cellHeight: 54,
  createCell: () => new MenuCell(),
  updateCell: (cell, index) => cell.dish = texts.items[index]
}).appendTo(tabris.ui.contentView);

tabris.ui.contentView.apply(texts);

class MenuCell extends tabris.Composite {

  constructor(properties) {
    super(properties);
    new tabris.TextView({
      id: 'priceText',
      top: MARGIN_SMALL, right: MARGIN,
      alignment: 'right',
      font: '14px',
      textColor: '#7CB342'
    }).appendTo(this);
    new tabris.TextView({
      id: 'nameText',
      left: MARGIN, top: MARGIN_SMALL, right: ['#priceText', 0],
      textColor: '#202020',
      font: 'bold 14px'
    }).appendTo(this);
    new tabris.TextView({
      id: 'descriptionText',
      textColor: '#767676',
      maxLines: 1,
      left: MARGIN, top: ['#nameText', 0], right: ['#priceText', MARGIN]
    }).appendTo(this);
    new tabris.Composite({
      left: 0, bottom: 0, right: 0, height: 1,
      background: '#e3e3e3'
    }).appendTo(this);
  }

  set dish(dish) {
    this.find('#priceText').set('text', dish.price);
    this.find('#nameText').set('text', dish.name);
    this.find('#descriptionText').set('text', dish.description);
  }

}

function loadLanguage(lang) {
  try {
    selectedLanguage = lang.replace(/-.*/, '');
    texts = require('./' + selectedLanguage + '.json');
  } catch (ex) {
    selectedLanguage = 'en';
    texts = require('./en.json');
  }
}
