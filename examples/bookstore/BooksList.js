const {CollectionView, Composite, ImageView, TextView, ui} = require('tabris');
const books = require('./books');

module.exports = class BooksList extends CollectionView {

  constructor(properties) {
    super(Object.assign({id: 'booksList', cellHeight: 72}, properties));
    this._books = books.filter(this.filter);
    this.on('select', ({index}) => this._showBookDetailsPage(books[index]));
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

  _showBookDetailsPage(book) {
    const BookDetailsPage = require('./BookDetailsPage');
    new BookDetailsPage({title: book.title, book}).appendTo(ui.find('NavigationView').first());
  }

  createCell() {
    super.createCell();
    return new BookCell();
  }

  updateCell(view, index) {
    super.updateCell(view, index);
    const {image, title, author} = books[index];
    Object.assign(view, {image, title, author});
  }

};

class BookCell extends Composite {

  constructor(properties) {
    super(Object.assign({highlightOnTouch: true}, properties));
    this._createUI();
    this._applyLayout();
    this._applyStyles();
  }

  set image(image) {
    this.find('#image').first().image = image;
  }

  get image() {
    return this.find('#image').first().image;
  }

  set title(title) {
    this.find('#titleLabel').first().text = title;
  }

  get title() {
    return this.find('#titleLabel').first().text;
  }

  set author(author) {
    this.find('#authorLabel').first().text = author;
  }

  get author() {
    return this.find('#authorLabel').first().text;
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
