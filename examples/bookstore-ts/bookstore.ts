declare var require: any;
declare var tabris: any;

const PAGE_MARGIN = 16;
import { loremIpsum , license } from './texts';
const books = require("./books.json");

tabris.create("Drawer").append(tabris.create("PageSelector"));


var bookStorePage = createBookListPage("TS Book Store", "images/page_all_books.png", () => true);
createBookListPage("Popular", "images/page_popular_books.png", book => book.popular);
createBookListPage("Favorite", "images/page_favorite_books.png", book => book.favorite);

tabris.create("Action", {
  title: "Settings",
  image: {src: "images/action_settings.png", scale: 3}
}).on("select", () => createLicensePage().open() );

bookStorePage.open();

function createBookListPage(title, image, filter) {
  return tabris.create("Page", {
    title: title,
    topLevel: true,
    image: {src: image, scale: 3}
  }).append(createBooksList(books.filter(filter)));
}

function createBookPage(book) {
  var page = tabris.create("Page", {
    title: book.title
  });
  createDetailsView(book)
    .set("layoutData", {top: 0, height: 192, left: 0, right: 0})
    .appendTo(page);

  tabris.create("TextView", {
    layoutData: {height: 1, right: 0, left: 0, top: "prev()"},
    background: "rgba(0, 0, 0, 0.1)"
  }).appendTo(page);

  createTabFolder().appendTo(page);

  return page;
}

function createDetailsView(book) {
  var composite = tabris.create("Composite", {
    background: "white",
    highlightOnTouch: true
  });
  tabris.create("Composite", {
    layoutData: {left: 0, right: 0, top: 0, height: 160 + 2 * PAGE_MARGIN}
  }).on("tap", () => {
    createReadBookPage(book).open();
  }).appendTo(composite);
  var coverView = tabris.create("ImageView", {
    layoutData: {height: 160, width: 106, left: PAGE_MARGIN, top: PAGE_MARGIN},
    image: book.image
  }).appendTo(composite);

  tabris.create("TextView", {
    markupEnabled: true,
    text: `<b>${book.title}</b>`,
    layoutData: {left: [coverView, PAGE_MARGIN], top: PAGE_MARGIN, right: PAGE_MARGIN}
  }).appendTo(composite);
  tabris.create("TextView", {
    layoutData: {left: [coverView, PAGE_MARGIN], top: ["prev()",PAGE_MARGIN]},
    text: book.author
  }).appendTo(composite);
  tabris.create("TextView", {
    layoutData: {left: [coverView, PAGE_MARGIN], top: ["prev()",PAGE_MARGIN]},
    textColor: "rgb(102, 153, 0)",
    text: "EUR 12,95"
  }).appendTo(composite);
  return composite;
}

function createTabFolder() {
  var tabFolder = tabris.create("TabFolder", {
    tabBarLocation: "top",
    paging: true,
    layoutData: {top: "prev()", left: 0, right: 0, bottom: 0}
  });
  var relatedTab = tabris.create("Tab", {title: "Related"}).appendTo(tabFolder);
  createBooksList(books).appendTo(relatedTab);
  var commentsTab = tabris.create("Tab", {title: "Comments"}).appendTo(tabFolder);
  tabris.create("TextView", {
    layoutData: {left: PAGE_MARGIN, top: PAGE_MARGIN, right: PAGE_MARGIN},
    text: "Great Book."
  }).appendTo(commentsTab);
  return tabFolder;
}

function createBooksList(books) {
  return tabris.create("CollectionView", {
    layoutData: {left: 0, right: 0, top: 0, bottom: 0},
    itemHeight: 72,
    items: books,
    initializeCell: (cell) => {
      var imageView = tabris.create("ImageView", {
        layoutData: {left: PAGE_MARGIN, centerY: 0, width: 32, height: 48},
        scaleMode: "fit"
      }).appendTo(cell);
      var titleTextView = tabris.create("TextView", {
        layoutData: {left: 64, right: PAGE_MARGIN, top: PAGE_MARGIN},
        markupEnabled: true,
        textColor: "#4a4a4a"
      }).appendTo(cell);
      var authorTextView = tabris.create("TextView", {
        layoutData: {left: 64, right: PAGE_MARGIN, top: [titleTextView, 4]},
        textColor: "#7b7b7b"
      }).appendTo(cell);
      cell.on("change:item", function(widget, book) {
        imageView.set("image", book.image);
        titleTextView.set("text", book.title);
        authorTextView.set("text", book.author);
      });
    }
  }).on("select", (target, value) => {
    createBookPage(value).open();
  });
}

function createReadBookPage(book) {
  var page = tabris.create("Page", {title: book.title});
  var scrollView = tabris.create("ScrollView", {
    layoutData: styles.full,
    direction: "vertical"
  }).appendTo(page);
  var titleTextView = tabris.create("TextView", {
    layoutData: {left: PAGE_MARGIN, top: PAGE_MARGIN * 2, right: PAGE_MARGIN},
    textColor: "rgba(0, 0, 0, 0.5)",
    markupEnabled: true,
    text: "<b>" + book.title + "</b>"
  }).appendTo(scrollView);
  tabris.create("TextView", {
    layoutData: {left: PAGE_MARGIN, right: PAGE_MARGIN, top: [titleTextView, PAGE_MARGIN], bottom: PAGE_MARGIN},
    text: loremIpsum
  }).appendTo(scrollView);
  return page;
}




function createLicensePage() {
  var page = tabris.create("Page", {
    title: "License"
  });
  tabris.create("TextView", {
    text: license.header ,
    layoutData: styles.license.item
  }).appendTo(page);
  tabris.create("TextView", {
    text: `<a href=\"${license.link.url}\">${license.link.caption}</a>`,
    markupEnabled: true,
    layoutData: styles.license.item
  }).on("tap", openLicenseWebPage ).appendTo(page);
  tabris.create("TextView", {
    text: license.authors,
    markupEnabled: true,
    layoutData: styles.license.item
  }).appendTo(page);
  return page;
}

function openLicenseWebPage() {
  var page = tabris.create("Page", {
    title: license.link.caption
  });
  tabris.create("WebView", {
    layoutData: styles.full,
    url: license.link.url
  }).appendTo(page);
  page.open();
  return page;
}



var styles = {
  license: {
    item: {left: PAGE_MARGIN, right: PAGE_MARGIN, top: ["prev()", 10]}
  },

  stack:{top: "prev()", left: 0, right: 0},
  full: {left: 0, top: 0, right: 0, bottom: 0},
};





//function RenderElement (elem = "Composite", params= {}) {
//  return tabris.create(elem, params);
//}
//
//
//
////function RenderTree (elem = "Composite", params= {}, children = []) {
////  let elem = RenderElement(elem,params);
////  children.forEach((child) => {
////    RenderElement
////  })
////}
//
//
//
//function Page (params = {}, children = []){
//  let page = RenderElement("Page", params);
//  children.forEach(child => {
//    child.appendTo(page);
//  });
//  return page;
//}
