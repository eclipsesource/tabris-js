const PAGE_MARGIN = 16;

let books = require('./books.json');

let navigationView = new tabris.NavigationView({
  left: 0, top: 0, right: 0, bottom: 0,
  drawerActionVisible: true
}).appendTo(tabris.ui.contentView);

tabris.ui.drawer.enabled = true;

let pageConfigurations = [{
  title: 'Book Store',
  image: 'images/page_all_books.png',
  filter: () => true
}, {
  title: 'Popular',
  image: 'images/page_popular_books.png',
  filter: book => book.popular
}, {
  title: 'Favorite',
  image: 'images/page_favorite_books.png',
  filter: book => book.favorite
}];

new tabris.CollectionView({
  left: 0, top: 16, right: 0, bottom: 0,
  itemCount: pageConfigurations.length,
  cellHeight: tabris.device.platform === 'iOS' ? 40 : 48,
  createCell: () => {
    let cell = new tabris.Composite({highlightOnTouch: true});
    new tabris.ImageView({
      id: 'bookImage',
      left: 16, top: 10, bottom: 10
    }).appendTo(cell);
    new tabris.TextView({
      id: 'bookTitle',
      left: 72, centerY: 0,
      font: tabris.device.platform === 'iOS' ? '17px .HelveticaNeueInterface-Regular' : 'medium 14px',
      textColor: tabris.device.platform === 'iOS' ? 'rgb(22, 126, 251)' : '#212121'
    }).appendTo(cell);
    return cell;
  },
  updateCell: (view, index) => {
    let page = pageConfigurations[index];
    view.find('#bookImage').image = page.image;
    view.find('#bookTitle').text = page.title;
  }
}).on('select', ({index}) => {
  tabris.ui.drawer.close();
  navigationView.pages().dispose();
  createBookListPage(pageConfigurations[index]).appendTo(navigationView);
}).appendTo(tabris.ui.drawer);

let excerpt = '"And thus the first man of the Pequod that mounted the mast to look out for ' +
  'the White Whale, on the White Whale\'s own peculiar ground; that man was ' +
  'swallowed up in the deep. But few, perhaps, thought of that at the time. ' +
  'Indeed, in some sort, they were not grieved at this event, at least as a ' +
  'portent; for they regarded it, not as a foreshadowing of evil in the ' +
  'future, but as the fulfilment of an evil already presaged. They declared ' +
  'that now they knew the reason of those wild shrieks they had heard the ' +
  'night before. But again the old Manxman said nay."';

new tabris.Action({
  id: 'licenseToggler',
  title: 'Settings',
  placementPriority: 'high',
  image: {
    src: tabris.device.platform === 'iOS' ? 'images/settings-black-24dp@3x.png' : 'images/settings-white-24dp@3x.png',
    scale: 3
  }
}).on('select', () => createSettingsPage().appendTo(navigationView))
  .appendTo(navigationView);

createBookListPage(pageConfigurations[0]).appendTo(navigationView);

function createBookListPage({title, filter}) {
  return new tabris.Page({
    title: title,
    autoDispose: false
  }).append(createBooksList(books.filter(filter)));
}

function createBookPage(book) {
  let page = new tabris.Page({
    title: book.title
  });
  let detailsComposite = createDetailsView(book).appendTo(page);
  detailsComposite.set({
    top: 0, height: 192, left: 0, right: 0
  });
  createTabFolder().set({
    top: [detailsComposite, 0], left: 0, right: 0, bottom: 0
  }).appendTo(page);
  return page;
}

function createDetailsView(book) {
  let composite = new tabris.Composite({
    highlightOnTouch: true,
    background: 'white',
    elevation: 4,
    left: 0, right: 0, top: 0, height: 160 + 2 * PAGE_MARGIN
  }).on('tap', () => createReadBookPage(book).appendTo(navigationView));
  let coverView = new tabris.ImageView({
    height: 160, width: 106, left: PAGE_MARGIN, top: PAGE_MARGIN,
    image: book.image
  }).appendTo(composite);
  let titleTextView = new tabris.TextView({
    left: [coverView, PAGE_MARGIN], top: PAGE_MARGIN, right: PAGE_MARGIN,
    markupEnabled: true,
    text: `<b>${book.title}</b>`
  }).appendTo(composite);
  let authorTextView = new tabris.TextView({
    left: [coverView, PAGE_MARGIN], top: [titleTextView, PAGE_MARGIN],
    text: book.author
  }).appendTo(composite);
  new tabris.TextView({
    left: [coverView, PAGE_MARGIN], top: [authorTextView, PAGE_MARGIN],
    textColor: 'rgb(102, 153, 0)',
    text: 'EUR 12,95'
  }).appendTo(composite);
  return composite;
}

function createTabFolder() {
  let tabFolder = new tabris.TabFolder({tabBarLocation: 'top', paging: true});
  let relatedTab = new tabris.Tab({title: 'Related'}).appendTo(tabFolder);
  createBooksList(books).appendTo(relatedTab);
  let commentsTab = new tabris.Tab({title: 'Comments'}).appendTo(tabFolder);
  new tabris.TextView({
    left: PAGE_MARGIN, top: PAGE_MARGIN, right: PAGE_MARGIN,
    text: 'Great Book.'
  }).appendTo(commentsTab);
  return tabFolder;
}

function createBooksList(books) {
  return new tabris.CollectionView({
    left: 0, right: 0, top: 0, bottom: 0,
    itemCount: books.length,
    cellHeight: 72,
    createCell: () => {
      let cell = new tabris.Composite({
        highlightOnTouch: true
      });
      new tabris.ImageView({
        id: 'bookImage',
        left: PAGE_MARGIN, centerY: 0, width: 32, height: 48,
        scaleMode: 'fit'
      }).appendTo(cell);
      let titleTextView = new tabris.TextView({
        id: 'bookTitle',
        left: 64, right: PAGE_MARGIN, top: PAGE_MARGIN,
        markupEnabled: true,
        textColor: '#4a4a4a'
      }).appendTo(cell);
      new tabris.TextView({
        id: 'bookAuthor',
        left: 64, right: PAGE_MARGIN, top: [titleTextView, 4],
        textColor: '#7b7b7b'
      }).appendTo(cell);
      return cell;
    },
    updateCell: (view, index) => {
      let book = books[index];
      view.find('#bookImage').image = book.image;
      view.find('#bookTitle').text = book.title;
      view.find('#bookAuthor').text = book.author;
    }
  }).on('select', ({index}) => createBookPage(books[index]).appendTo(navigationView));
}

function createReadBookPage(book) {
  let page = new tabris.Page({title: book.title});
  let scrollView = new tabris.ScrollView({
    left: 0, right: 0, top: 0, bottom: 0,
    direction: 'vertical'
  }).appendTo(page);
  let titleTextView = new tabris.TextView({
    left: PAGE_MARGIN, top: PAGE_MARGIN * 2, right: PAGE_MARGIN,
    textColor: 'rgba(0, 0, 0, 0.5)',
    markupEnabled: true,
    text: `<b>${book.title}</b>`
  }).appendTo(scrollView);
  new tabris.TextView({
    left: PAGE_MARGIN, right: PAGE_MARGIN, top: [titleTextView, PAGE_MARGIN],
    text: excerpt
  }).appendTo(scrollView);
  return page;
}

function createSettingsPage() {
  let page = new tabris.Page({
    title: 'License'
  }).on('appear', () => actionVisbility(false))
    .on('disappear', () => actionVisbility(true));
  let settingsTextView = new tabris.TextView({
    left: PAGE_MARGIN, right: PAGE_MARGIN, top: PAGE_MARGIN,
    text: 'Book covers under CC BY 2.0'
  }).appendTo(page);
  let linkTextView = new tabris.TextView({
    left: PAGE_MARGIN, right: PAGE_MARGIN, top: [settingsTextView, 10],
    text: 'Covers on flickr',
    textColor: 'rgba(71, 161, 238, 0.75)'
  }).on('tap', () => createLicenseWebviewPage().appendTo(navigationView))
    .appendTo(page);
  new tabris.TextView({
    left: PAGE_MARGIN, right: PAGE_MARGIN, top: [linkTextView, 10],
    text: '<i>Authors of book covers:</i><br/>' +
      'Paula Rodriguez - 1984<br/>' +
      'Marc Storrs and Rob Morphy - Na Tropie Nieznanych<br/>' +
      'Cat Finnie - Stary Czlowiek I Morze<br/>' +
      'Andrew Brozyna - Hobbit<br/>' +
      'Viacheslav Vystupov - Wojna Swiatow<br/>' +
      'Marc Storrs and Rob Morphy - Zegar Pomaranczowy Pracz<br/>' +
      'Andrew Evan Harner - Ksiega Dzungli',
    markupEnabled: true
  }).appendTo(page);
  return page;
}

function createLicenseWebviewPage() {
  let page = new tabris.Page({
    title: 'Book covers license'
  }).on('appear', () => actionVisbility(false));
  new tabris.WebView({
    left: 0, right: 0, top: 0, bottom: 0,
    url: 'https://www.flickr.com/photos/ajourneyroundmyskull/sets/72157626894978086/'
  }).appendTo(page);
  return page;
}

function actionVisbility(isVisible) {
  tabris.ui.children('#licenseToggler').visible = isVisible;
}
