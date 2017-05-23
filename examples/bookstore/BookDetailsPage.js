const {Composite, ImageView, Tab, TabFolder, TextView, Page, ui} = require('tabris');
const BookReadPage = require('./BookReadPage');
const BooksList = require('./BooksList');

const PRICE = 'EUR 12,95';
const RELATED_TAB_TITLE = 'Related';
const COMMENTS_TAB_TITLE = 'Comments';
const COMMENT = 'Great Book';

module.exports = class BookDetailsPage extends Page {

  constructor(properties) {
    super(properties);
    this._createUI();
    this._applyLayout();
    this._applyStyles();
  }

  _createUI() {
    this.append(
      new Composite({id: 'detailsView'}).on('tap', () => this._openReadBookPage())
        .append(
          new ImageView({id: 'coverImage', image: this.book.image}),
          new TextView({id: 'titleLabel', text: this.book.title}),
          new TextView({id: 'authorLabel', text: this.book.author}),
          new TextView({id: 'priceLabel', text: PRICE})
        ),
      new TabFolder({id: 'tabFolder', tabBarLocation: 'top', paging: true}).append(
        new Tab({title: RELATED_TAB_TITLE}).append(
          new BooksList()
        ),
        new Tab({title: COMMENTS_TAB_TITLE}).append(
          new TextView({id: 'commentLabel', text: COMMENT})
        )
      )
    );
  }

  _openReadBookPage() {
    new BookReadPage({title: this.title}).appendTo(ui.find('NavigationView').first());
  }

  set book(book) {
    this._book = book;
  }

  get book() {
    return this._book;
  }

  _applyLayout() {
    this.apply({
      '#detailsView': {top: 0, height: 192, left: 0, right: 0, elevation: 4},
      '#tabFolder': {top: 'prev()', left: 0, right: 0, bottom: 0},
      '#booksList': {left: 0, top: 0, right: 0, bottom: 0},
      '#coverImage': {height: 160, width: 106, left: 16, top: 16},
      '#titleLabel': {left: '#coverImage 16', top: 16, right: 16},
      '#authorLabel': {left: '#coverImage 16', top: 'prev() 8'},
      '#priceLabel': {left: '#coverImage 16', top: 'prev() 8'},
      '#commentLabel': {left: 16, top: 16, right: 16},
    });
  }

  _applyStyles() {
    this.apply({
      '#detailsView': {highlightOnTouch: true, background: 'white'},
      '#titleLabel': {font: 'bold 14px sans-serif'},
      '#authorLabel': {font: '14px'},
      '#priceLabel': {font: '14px', textColor: 'rgb(102, 153, 0)'}
    });
  }

};
