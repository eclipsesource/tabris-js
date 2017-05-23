const {Page} = require('tabris');
const BooksList = require('./BooksList');

module.exports = class BooksPage extends Page {

  constructor(properties) {
    super(Object.assign({autoDispose: false}, properties));
    this.createUI();
    this.applyLayout();
  }

  set filter(filter) {
    this._filter = filter;
  }

  get filter() {
    return this._filter;
  }

  createUI() {
    this.append(
      new BooksList({filter: this.filter})
    );
  }

  applyLayout() {
    this.find('#booksList').set({left: 0, top: 0, right: 0, bottom: 0});
  }

};
