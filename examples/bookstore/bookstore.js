var PAGE_MARGIN = 16;
var books = require('./books.json');

var navigationView = new tabris.NavigationView({
  left: 0, top: 0, right: 0, bottom: 0,
  drawerActionVisible: true
}).appendTo(tabris.ui.contentView);

tabris.ui.drawer.enabled = true;

var bookListPageDescriptors = [{
  title: 'Book Store',
  image: 'images/page_all_books.png',
  filter: function() {return true;}
},{
  title: 'Popular',
  image: 'images/page_popular_books.png',
  filter: function(book) {return book.popular;}
},{
  title: 'Favorite',
  image: 'images/page_favorite_books.png',
  filter: function(book) {return book.favorite;}
}];

var pageSelector = new tabris.CollectionView({
  items: bookListPageDescriptors,
  initializeCell: initializeCell,
  itemHeight: tabris.device.platform === 'iOS' ? 40 : 48,
  layoutData: {left: 0, top: 0, right: 0, bottom: 0}
}).appendTo(tabris.ui.drawer);

pageSelector.on('select', function(target, descriptor) {
  tabris.ui.drawer.close();
  navigationView.pages().dispose();
  createBookListPage(descriptor).appendTo(navigationView);
});

function initializeCell(cell) {
  new tabris.Composite({
    layoutData: {left: 0, right: 0, bottom: 0, height: 1},
    background: '#bbb'
  }).appendTo(cell);
  var imageView = new tabris.ImageView({
    layoutData: {left: 10, top: 10, bottom: 10}
  }).appendTo(cell);
  var textView = new tabris.TextView({
    layoutData: {left: 72, centerY: 0},
    font: tabris.device.platform === 'iOS' ? '17px .HelveticaNeueInterface-Regular' : '14px Roboto Medium',
    textColor: tabris.device.platform === 'iOS' ? 'rgb(22, 126, 251)' : '#212121'
  }).appendTo(cell);
  cell.on('change:item', function(widget, page) {
    imageView.set('image', page.image);
    textView.set('text', page.title);
  });
}

var loremIpsum = 'Etiam nisl nisi, egestas quis lacus ut, tristique suscipit metus. In ' +
                 'vehicula lectus metus, at accumsan elit fringilla blandit. Integer et quam ' +
                 'sed dolor pharetra molestie id eget dui. Donec ac libero eu lectus dapibus ' +
                 'placerat eu a tellus. Fusce vulputate ac sem sit amet bibendum. Pellentesque ' +
                 'euismod varius purus nec pharetra. Sed vitae ipsum sit amet risus vehicula ' +
                 'euismod in at nunc. Sed in viverra arcu, id blandit risus. Praesent sagittis ' +
                 'quis nisl id molestie. Donec dignissim, nisl id volutpat consectetur, massa ' +
                 'diam aliquam lectus, sed euismod leo elit eu justo. Integer vel ante ' +
                 'sapien.';

new tabris.Action({
  id: 'licenseToggler',
  title: 'Settings',
  placementPriority: 'high',
  image: {src: 'images/action_settings.png', scale: 3}
}).on('select', function() {
  createSettingsPage().appendTo(navigationView);
}).appendTo(navigationView);

createBookListPage(bookListPageDescriptors[0]).appendTo(navigationView);

function createBookListPage(descriptor) {
  return new tabris.Page({
    title: descriptor.title,
    image: {src: descriptor.image, scale: 3},
    autoDispose: false
  }).append(createBooksList(books.filter(descriptor.filter)));
}

function createBookPage(book) {
  var page = new tabris.Page({
    title: book.title
  });
  var detailsComposite = createDetailsView(book).appendTo(page);
  detailsComposite.layoutData = {top: 0, height: 192, left: 0, right: 0};

  createTabFolder().set({
    layoutData: {top: [detailsComposite, 0], left: 0, right: 0, bottom: 0}
  }).appendTo(page);
  new tabris.TextView({
    layoutData: {height: 1, right: 0, left: 0, top: [detailsComposite, 0]},
    background: 'rgba(0, 0, 0, 0.1)'
  }).appendTo(page);
  return page;
}

function createDetailsView(book) {
  var composite = new tabris.Composite({
    background: 'white',
    highlightOnTouch: true
  });
  new tabris.Composite({
    layoutData: {left: 0, right: 0, top: 0, height: 160 + 2 * PAGE_MARGIN}
  }).on('tap', function() {
    createReadBookPage(book).appendTo(navigationView);
  }).appendTo(composite);
  var coverView = new tabris.ImageView({
    layoutData: {height: 160, width: 106, left: PAGE_MARGIN, top: PAGE_MARGIN},
    image: book.image
  }).appendTo(composite);
  var titleTextView = new tabris.TextView({
    markupEnabled: true,
    text: '<b>' + book.title + '</b>',
    layoutData: {left: [coverView, PAGE_MARGIN], top: PAGE_MARGIN, right: PAGE_MARGIN}
  }).appendTo(composite);
  var authorTextView = new tabris.TextView({
    layoutData: {left: [coverView, PAGE_MARGIN], top: [titleTextView, PAGE_MARGIN]},
    text: book.author
  }).appendTo(composite);
  new tabris.TextView({
    layoutData: {left: [coverView, PAGE_MARGIN], top: [authorTextView, PAGE_MARGIN]},
    textColor: 'rgb(102, 153, 0)',
    text: 'EUR 12,95'
  }).appendTo(composite);
  return composite;
}

function createTabFolder() {
  var tabFolder = new tabris.TabFolder({tabBarLocation: 'top', paging: true});
  var relatedTab = new tabris.Tab({title: 'Related'}).appendTo(tabFolder);
  createBooksList(books).appendTo(relatedTab);
  var commentsTab = new tabris.Tab({title: 'Comments'}).appendTo(tabFolder);
  new tabris.TextView({
    layoutData: {left: PAGE_MARGIN, top: PAGE_MARGIN, right: PAGE_MARGIN},
    text: 'Great Book.'
  }).appendTo(commentsTab);
  return tabFolder;
}

function createBooksList(books) {
  return new tabris.CollectionView({
    layoutData: {left: 0, right: 0, top: 0, bottom: 0},
    itemHeight: 72,
    items: books,
    initializeCell: function(cell) {
      var imageView = new tabris.ImageView({
        layoutData: {left: PAGE_MARGIN, centerY: 0, width: 32, height: 48},
        scaleMode: 'fit'
      }).appendTo(cell);
      var titleTextView = new tabris.TextView({
        layoutData: {left: 64, right: PAGE_MARGIN, top: PAGE_MARGIN},
        markupEnabled: true,
        textColor: '#4a4a4a'
      }).appendTo(cell);
      var authorTextView = new tabris.TextView({
        layoutData: {left: 64, right: PAGE_MARGIN, top: [titleTextView, 4]},
        textColor: '#7b7b7b'
      }).appendTo(cell);
      cell.on('change:item', function(widget, book) {
        imageView.image = book.image;
        titleTextView.text = book.title;
        authorTextView.text = book.author;
      });
    }
  }).on('select', function(target, value) {
    createBookPage(value).appendTo(navigationView);
  });
}

function createReadBookPage(book) {
  var page = new tabris.Page({title: book.title});
  var scrollView = new tabris.ScrollView({
    layoutData: {left: 0, right: 0, top: 0, bottom: 0},
    direction: 'vertical'
  }).appendTo(page);
  var titleTextView = new tabris.TextView({
    layoutData: {left: PAGE_MARGIN, top: PAGE_MARGIN * 2, right: PAGE_MARGIN},
    textColor: 'rgba(0, 0, 0, 0.5)',
    markupEnabled: true,
    text: '<b>' + book.title + '</b>'
  }).appendTo(scrollView);
  new tabris.TextView({
    layoutData: {left: PAGE_MARGIN, right: PAGE_MARGIN, top: [titleTextView, PAGE_MARGIN], bottom: PAGE_MARGIN},
    text: [loremIpsum, loremIpsum, loremIpsum].join('\n\n')
  }).appendTo(scrollView);
  return page;
}

function createSettingsPage() {
  var page = new tabris.Page({
    title: 'License'
  })
  .on('appear', function() { actionVisbility(false); })
  .on('disappear', function() { actionVisbility(true); });
  var settingsTextView = new tabris.TextView({
    text: 'Book covers under CC BY 2.0',
    layoutData: {left: PAGE_MARGIN, right: PAGE_MARGIN, top: PAGE_MARGIN}
  }).appendTo(page);
  var linkTextView = new tabris.TextView({
    text: 'Covers on flickr',
    textColor: 'rgba(71, 161, 238, 0.75)',
    layoutData: {left: PAGE_MARGIN, right: PAGE_MARGIN, top: [settingsTextView, 10]}
  }).on('tap', function() {
    createLicenseWebviewPage().appendTo(navigationView);
  }).appendTo(page);
  new tabris.TextView({
    text: '<i>Authors of book covers:</i><br/>' +
      'Paula Rodriguez - 1984<br/>' +
      'Marc Storrs and Rob Morphy - Na Tropie Nieznanych<br/>' +
      'Cat Finnie - Stary Czlowiek I Morze<br/>' +
      'Andrew Brozyna - Hobbit<br/>' +
      'Viacheslav Vystupov - Wojna Swiatow<br/>' +
      'Marc Storrs and Rob Morphy - Zegar Pomaranczowy Pracz<br/>' +
      'Andrew Evan Harner - Ksiega Dzungli',
    markupEnabled: true,
    layoutData: {left: PAGE_MARGIN, right: PAGE_MARGIN, top: [linkTextView, 10]}
  }).appendTo(page);
  return page;
}

function createLicenseWebviewPage() {
  var page = new tabris.Page({
    title: 'Book covers license'
  })
  .on('appear', function() { actionVisbility(false); });
  new tabris.WebView({
    url: 'https://www.flickr.com/photos/ajourneyroundmyskull/sets/72157626894978086/',
    layoutData: {left: 0, right: 0, top: 0, bottom: 0}
  }).appendTo(page);
  return page;
}

function actionVisbility(isVisible) {
  tabris.ui.children('#licenseToggler').set('visible',isVisible);
}
