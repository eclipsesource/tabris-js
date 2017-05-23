const {Composite, ImageView, TextView, ui} = require('tabris');
const BooksPage = require('./BooksPage');

const PAGE_DATA = [{
  title: 'Book Store',
  drawerIcon: 'images/page_all_books.png'
}, {
  title: 'Favorites',
  drawerIcon: 'images/page_favorite_books.png',
  filter: book => book.favorite
}, {
  title: 'Popular',
  drawerIcon: 'images/page_popular_books.png',
  filter: book => book.popular
}];

module.exports = class BooksPageSelector extends Composite {

  constructor(properties) {
    super(properties);
    this._createUI();
    this._applyLayout();
    this._applyStyles();
    let {title, filter} = PAGE_DATA[0];
    this._open(new BooksPage({title, filter}));
  }

  _createUI() {
    this.append(
      PAGE_DATA.map(({title, drawerIcon, filter}) =>
        new Composite({class: 'pageEntry', highlightOnTouch: true}).append(
          new ImageView({class: 'image', image: drawerIcon}),
          new TextView({class: 'titleLabel', text: title})
        ).on('tap', () => this._open(new BooksPage({title, filter})))
      )
    );
  }

  _open(page) {
    let navigationView = ui.find('NavigationView').first();
    navigationView.pageAnimation = 'none';
    tabris.ui.drawer.close();
    navigationView.pages().dispose();
    page.appendTo(navigationView);
    navigationView.pageAnimation = 'default';
  }

  _applyLayout() {
    this.apply({
      '.pageEntry': {left: 0, top: 'prev()', right: 0, height: device.platform === 'iOS' ? 40 : 48},
      '.image': {left: 16, top: 10, bottom: 10},
      '.titleLabel': {left: 72, centerY: 0}
    });
  }

  _applyStyles() {
    this.apply({
      '.titleLabel': {
        font: device.platform === 'iOS' ? '17px .HelveticaNeueInterface-Regular' : 'medium 14px',
        textColor: device.platform === 'iOS' ? 'rgb(22, 126, 251)' : '#212121'
      }
    });
  }

};
