const {CollectionView, Composite, ImageView, TextView, contentView} = require('tabris');
const books = require('./books');

module.exports = class BooksList extends CollectionView {

  constructor(properties) {
    super(Object.assign({id: 'booksList', cellHeight: 72}, properties));
    this._books = books.filter(this.filter);
    this.itemCount = this.books.length;
  }

  get books() {
    return this._books;
  }

  set filter(filter) {
    this._filter = filter;
  }

  get filter() {
    return this._filter || (() => true);
  }

  createCell() {
    super.createCell();
    return new BookCell();
  }

  updateCell(view, index) {
    super.updateCell(view, index);
    Object.assign(view, {book: books[index]});
  }

};

class BookCell extends Composite {

  constructor(properties) {
    super(Object.assign({highlightOnTouch: true}, properties));
    this._createUI();
    this._applyLayout();
    this._applyStyles();
    this.onTap(this._showBookDetailsPage);
  }

  set book(book) {
    this._book = book;
    this.find('#image').first().image = book.image;
    this.find('#titleLabel').first().text = book.title;
    this.find('#authorLabel').first().text = book.author;
  }

  get book() {
    return this._book;
  }

  _showBookDetailsPage() {
    const BookDetailsPage = require('./BookDetailsPage');
    new BookDetailsPage({title: this.book.title, book: this.book}).appendTo(contentView.find('NavigationView').first());
  }

  _createUI() {
    this.append(
      new ImageView({id: 'image'}),
      new TextView({id: 'titleLabel', markupEnabled: true}),
      new TextView({id: 'authorLabel'})
    );
  }

  _applyLayout() {
    this.apply({
      '#image': {left: 16, centerY: 0, width: 32, height: 48, scaleMode: 'fit'},
      '#titleLabel': {left: 64, right: 16, top: 16},
      '#authorLabel': {left: 64, right: 16, top: 'prev() 4'}
    });
  }

  _applyStyles() {
    this.apply({
      '#titleLabel': {textColor: '#4a4a4a'},
      '#authorLabel': {textColor: '#7b7b7b'}
    });
  }

}
