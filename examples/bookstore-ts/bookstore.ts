declare var tabris: any;

const PAGE_MARGIN = 16;

/*************************
 * Import Components
 *************************/
import { Page, WebView, TextView, Text, ScrollView, TabFolder, Tab, Composite, Image, ImageView, CollectionView, Action, Drawer, PageSelector} from './tabris-components'
import { Spacer, Each } from './custom-components';

/*************************
 * Import Services
 *************************/
import {getBooks, getRelatedBooks, getBookComments, getBookPreview} from "./books/books-service"
import { license } from './texts';


/*************************
 * Styles
 *************************/

const styles = {
    stackMargin: {left: PAGE_MARGIN, top: "prev()", right: PAGE_MARGIN},
    stack:{top: "prev()", left: 0, right: 0},

    full: {left: 0, top: 0, right: 0, bottom: 0},
};

const generalStyles= {
    '#appDrawer': {
        background: 'blue'
    }
};


/*************************
 * Application Start
 *************************/

function AppNavigationStart(){
  // Drawer Init
  Drawer('#appDrawer',[
    PageSelector,
  ]).apply(generalStyles);

  // Action init
  Action({
    title: "License",
    image: {src: "images/action_settings.png", scale: 3}
  }).on("select", openLicensePage);

  let bookStorePage = BookListPage("Book Store", "images/page_all_books.png");
  BookListPage("Popular", "images/page_popular_books.png", book => book.popular);
  BookListPage("Favorite", "images/page_favorite_books.png", book => book.favorite);

  bookStorePage.open();
  // tabris.ui.children("Page")[0].open();
}


/*************************
 * Book Pages
 *************************/
function BookListPage(title: string, image : string, filter? : Function) {
  return (
      Page ({
        title: title,
        topLevel: true,
        image: {src: image, scale: 3}
      }, [
        BooksList( getBooks(filter) ),
      ])
  )
}

function openBookPage(book) {
  return (
      Page ({title: book.title}, [
        BookDetails(book),
        Spacer(),
        BookTabs(book),
      ]).open()
  )
}

function openReadBookPage(book) {
  return (
      Page ( book.title , [
        ScrollView({layoutData: styles.full, direction: "vertical"}, [
          Text('.bookTitle', book.title),
          Text('.bookChapter',getBookPreview(book.id))
        ]),
      ]).apply(readBookPageStyles).open()
  )
}

const readBookPageStyles = {
    '.bookTitle':{
        layoutData: {left: PAGE_MARGIN, top: PAGE_MARGIN * 2, right: PAGE_MARGIN},
        textColor: "rgba(0, 0, 0, 0.5)",
            font: "bold 20px",
    },
    '.bookChapter':{
        layoutData: {left: PAGE_MARGIN, right: PAGE_MARGIN, top: ["prev()", PAGE_MARGIN], bottom: PAGE_MARGIN},
    }
};

/*************************
 * Book Sub-components
 *************************/

function BooksList(books) {
  return (
      CollectionView({
        layoutData: styles.full,
        itemHeight: 72,
        items: books,
        initializeCell: (cell) => {
          [
            Image('.bookImage', {
              layoutData: {left: PAGE_MARGIN, centerY: 0, width: 32, height: 48},
              scaleMode: "fit"
            }),
            Text('.bookTitle', {
              layoutData: {left: 64, right: PAGE_MARGIN, top: PAGE_MARGIN},
              textColor: "#4a4a4a"
            }),
            Text('.bookAuthor', {
              layoutData: {left: 64, right: PAGE_MARGIN, top: ["prev()", 4]},
              textColor: "#7b7b7b"
            })
          ].forEach(elem => elem.appendTo(cell))

          cell.on("change:item", function(widget, book) {
            cell.children(".bookImage").set("image",book.image);
            cell.children(".bookTitle").set("text",book.title);
            cell.children(".bookAuthor").set("text",book.author);
          });
        }
      }).on("select", (target, value) => { openBookPage(value) })
  )
}

function BookDetails(book) {
  return (
      Composite(bookDetailsStyle.container,[
        Image(book.image, bookDetailsStyle.image),
        Composite(bookDetailsStyle.textContainer , [
            Text(book.title,bookDetailsStyle.title , fadeInRight(500, 100) ),
            Text(book.author, bookDetailsStyle.author , fadeInRight(500, 300) ),
            Text(book.price, bookDetailsStyle.price , fadeInRight(600, 500))
        ])
      ]).on("tap",  () => { openReadBookPage(book) })
  )
}

function fadeInRight(duration, delay = 0) {
    return (widget) => {
        widget.set({
            opacity: 0.0,
            transform: {translationX: 32}
        });
        widget.animate({
            opacity: 1.0,
            transform: {translationX: 0}
        }, {
            duration: duration,
            delay: delay,
            easing: "ease-out"
        });
    }
}


const bookDetailsStyle = {
    container: {
        background: "white",
        highlightOnTouch: true,
        top: 0, height: 192, left: 0, right: 0
    },
    image: {
        height: 160, width: 106, left: PAGE_MARGIN, top: PAGE_MARGIN
    },
    textContainer: {
        left: ["prev()", PAGE_MARGIN],
        top: PAGE_MARGIN,
        right: PAGE_MARGIN
    },
    title: {
        font: "bold 20px",
        left: 0, top: "prev()", right: 0
    },
    author: {
        left: 0, top: "prev()", right: 0
    },
    price: {
        left: 0, top: ["prev()",PAGE_MARGIN],
        textColor: "rgb(102, 153, 0)"
    }
}

function BookTabs(book) {
  return (
      TabFolder ({
        tabBarLocation: "top",
        paging: true,
        layoutData: {top: "prev()", left: 0, right: 0, bottom: 0}
      }, [
        // Related Tab
        Tab('Related',[
          BooksList(getRelatedBooks(book.id))
        ]),
        // Comments Tab
        Tab('Comments',[
          CommentsList(getBookComments(book.id))
        ])
      ])
  )
}

function CommentsList(comments : any[] = []) {
  return (
      ScrollView(styles.full,
          Each (comments, CommentItem, NoComments)
      )
  )
}

function CommentItem(comment) {
  return (
      Composite('.commentContainer', [
          Image('.commenterAvatar', comment.user.avatar),
          Text('.commentAuthor', comment.user.name),
          Text('.commentText',comment.text)
        ]).apply(commentStyling)
  )
}

function NoComments() {
  return (
      Composite('.commentContainer', [
        Text('.noComments','No comments yet for this item :('),
      ])
  )
}

const commentStyling = {
    '.commentContainer': styles.stackMargin,
    '.commenterAvatar': {
        left: PAGE_MARGIN,
        top: 10,
        width: 32,
        height: 48,
        scaleMode: "fit",
    },
    '.commentText':{
        left: 64,
        right: PAGE_MARGIN,
        top: "prev()",
        textColor: "#7b7b7b",
    },
    '.commentAuthor': {
        left: 64,
        right: PAGE_MARGIN,
        top: 15,
        textColor: "#000000",
    },
    '.noComments': {
        left: 64,
        right: PAGE_MARGIN,
        top: 15,
        textColor: "#000000",
        font: "bold 16px",
    }
}


/*************************
 * License Pages
 *************************/

const licenseConfig = {
    header: {
        layoutData: {left: PAGE_MARGIN, right: PAGE_MARGIN, top: ["prev()", 10]},
    },
    caption: {
        textColor: "rgba(71, 161, 238, 0.75)",
        layoutData: {left: PAGE_MARGIN, right: PAGE_MARGIN, top: ["prev()", 10]}
    },
    authors: {
        markupEnabled: true,
        layoutData: {left: PAGE_MARGIN, right: PAGE_MARGIN, top: ["prev()", 10]}
    }
}

function openLicensePage() {
  return (
      Page ("License", [
        Text(license.header, licenseConfig.header),
        Text(license.link.caption, licenseConfig.caption).on("tap", openLicenseWebPage ),
        Text(license.authors, licenseConfig.authors)
      ]).open()
  )
}

function openLicenseWebPage() {
  return (
    Page (license.link.caption,[
      WebView ({
        layoutData: styles.full,
        url: license.link.url
      })
    ]).open()
  )
}




/*************************
 * Main
 *************************/

AppNavigationStart();

