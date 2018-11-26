const {Composite, CollectionView, Picker, TextView, contentView} = require('tabris');

const LANGUAGES = [{
  id: 'en',
  name: 'English'
}, {
  id: 'de',
  name: 'Deutsch'
}];
let selectedLanguage, texts;

loadLanguage(device.language);

new Picker({
  left: 16, top: 8, right: 16,
  itemCount: LANGUAGES.length,
  itemText: index => LANGUAGES[index].name,
  selectionIndex: LANGUAGES.map(element => element.id).indexOf(selectedLanguage)
}).on('select', ({index}) => {
  loadLanguage(LANGUAGES[index].id);
  collectionView.itemCount = texts.items.length;
  collectionView.refresh();
}).appendTo(contentView);

const collectionView = new CollectionView({
  left: 0, top: 'prev() 8', right: 0, bottom: 0,
  itemCount: texts.items.length,
  cellHeight: 54,
  createCell: () => new MenuCell(),
  updateCell: (cell, index) => cell.dish = texts.items[index]
}).appendTo(contentView);

contentView.apply(texts);

class MenuCell extends Composite {

  constructor(properties) {
    super(properties);
    new TextView({
      id: 'priceText',
      top: 8, right: 16,
      alignment: 'right',
      font: '14px',
      textColor: '#7CB342'
    }).appendTo(this);
    new TextView({
      id: 'nameText',
      left: 16, top: 8, right: '#priceText',
      textColor: '#202020',
      font: 'bold 14px'
    }).appendTo(this);
    new TextView({
      id: 'descriptionText',
      textColor: '#767676',
      maxLines: 1,
      left: 16, top: '#nameText', right: '#priceText 16'
    }).appendTo(this);
    new Composite({
      left: 0, bottom: 0, right: 0, height: 1,
      background: '#e3e3e3'
    }).appendTo(this);
  }

  set dish(dish) {
    this.find('#priceText').set({text: dish.price});
    this.find('#nameText').set({text: dish.name});
    this.find('#descriptionText').set({text: dish.description});
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
