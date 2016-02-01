var PAGE_MARGIN = 16;
/*************************
 * Import Components
 *************************/
var tabris_components_1 = require('./tabris-components');
var custom_components_1 = require('./custom-components');
/*************************
 * Import Services
 *************************/
var books_service_1 = require("./books/books-service");
var texts_1 = require('./texts');
/*************************
 * Styles
 *************************/
var styles = {
    stackMargin: { left: PAGE_MARGIN, top: "prev()", right: PAGE_MARGIN },
    stack: { top: "prev()", left: 0, right: 0 },
    full: { left: 0, top: 0, right: 0, bottom: 0 }
};
var generalStyles = {
    '#appDrawer': {
        background: 'blue'
    }
};
/*************************
 * Application Start
 *************************/
function AppNavigationStart() {
    // Drawer Init
    tabris_components_1.Drawer('#appDrawer', [
        tabris_components_1.PageSelector,
    ]).apply(generalStyles);
    // Action init
    tabris_components_1.Action({
        title: "License",
        image: { src: "images/action_settings.png", scale: 3 }
    }).on("select", openLicensePage);
    var bookStorePage = BookListPage("Book Store", "images/page_all_books.png");
    BookListPage("Popular", "images/page_popular_books.png", function (book) { return book.popular; });
    BookListPage("Favorite", "images/page_favorite_books.png", function (book) { return book.favorite; });
    bookStorePage.open();
    // tabris.ui.children("Page")[0].open();
}
/*************************
 * Book Pages
 *************************/
function BookListPage(title, image, filter) {
    return (tabris_components_1.Page({
        title: title,
        topLevel: true,
        image: { src: image, scale: 3 }
    }, [
        BooksList(books_service_1.getBooks(filter)),
    ]));
}
function openBookPage(book) {
    return (tabris_components_1.Page({ title: book.title }, [
        BookDetails(book),
        custom_components_1.Spacer(),
        BookTabs(book),
    ]).open());
}
function openReadBookPage(book) {
    return (tabris_components_1.Page(book.title, [
        tabris_components_1.ScrollView({ layoutData: styles.full, direction: "vertical" }, [
            tabris_components_1.Text('.bookTitle', book.title),
            tabris_components_1.Text('.bookChapter', books_service_1.getBookPreview(book.id))
        ]),
    ]).apply(readBookPageStyles).open());
}
var readBookPageStyles = {
    '.bookTitle': {
        layoutData: { left: PAGE_MARGIN, top: PAGE_MARGIN * 2, right: PAGE_MARGIN },
        textColor: "rgba(0, 0, 0, 0.5)",
        font: "bold 20px"
    },
    '.bookChapter': {
        layoutData: { left: PAGE_MARGIN, right: PAGE_MARGIN, top: ["prev()", PAGE_MARGIN], bottom: PAGE_MARGIN }
    }
};
/*************************
 * Book Sub-components
 *************************/
function BooksList(books) {
    return (tabris_components_1.CollectionView({
        layoutData: styles.full,
        itemHeight: 72,
        items: books,
        initializeCell: function (cell) {
            [
                tabris_components_1.Image('.bookImage', {
                    layoutData: { left: PAGE_MARGIN, centerY: 0, width: 32, height: 48 },
                    scaleMode: "fit"
                }),
                tabris_components_1.Text('.bookTitle', {
                    layoutData: { left: 64, right: PAGE_MARGIN, top: PAGE_MARGIN },
                    textColor: "#4a4a4a"
                }),
                tabris_components_1.Text('.bookAuthor', {
                    layoutData: { left: 64, right: PAGE_MARGIN, top: ["prev()", 4] },
                    textColor: "#7b7b7b"
                })
            ].forEach(function (elem) { return elem.appendTo(cell); });
            cell.on("change:item", function (widget, book) {
                cell.children(".bookImage").set("image", book.image);
                cell.children(".bookTitle").set("text", book.title);
                cell.children(".bookAuthor").set("text", book.author);
            });
        }
    }).on("select", function (target, value) { openBookPage(value); }));
}
function BookDetails(book) {
    return (tabris_components_1.Composite(bookDetailsStyle.container, [
        tabris_components_1.Image(book.image, bookDetailsStyle.image),
        tabris_components_1.Composite(bookDetailsStyle.textContainer, [
            tabris_components_1.Text(book.title, bookDetailsStyle.title, fadeInRight(500, 100)),
            tabris_components_1.Text(book.author, bookDetailsStyle.author, fadeInRight(500, 300)),
            tabris_components_1.Text(book.price, bookDetailsStyle.price, fadeInRight(600, 500))
        ])
    ]).on("tap", function () { openReadBookPage(book); }));
}
function fadeInRight(duration, delay) {
    if (delay === void 0) { delay = 0; }
    return function (widget) {
        widget.set({
            opacity: 0.0,
            transform: { translationX: 32 }
        });
        widget.animate({
            opacity: 1.0,
            transform: { translationX: 0 }
        }, {
            duration: duration,
            delay: delay,
            easing: "ease-out"
        });
    };
}
var bookDetailsStyle = {
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
        left: 0, top: ["prev()", PAGE_MARGIN],
        textColor: "rgb(102, 153, 0)"
    }
};
function BookTabs(book) {
    return (tabris_components_1.TabFolder({
        tabBarLocation: "top",
        paging: true,
        layoutData: { top: "prev()", left: 0, right: 0, bottom: 0 }
    }, [
        // Related Tab
        tabris_components_1.Tab('Related', [
            BooksList(books_service_1.getRelatedBooks(book.id))
        ]),
        // Comments Tab
        tabris_components_1.Tab('Comments', [
            CommentsList(books_service_1.getBookComments(book.id))
        ])
    ]));
}
function CommentsList(comments) {
    if (comments === void 0) { comments = []; }
    return (tabris_components_1.ScrollView(styles.full, custom_components_1.Each(comments, CommentItem, NoComments)));
}
function CommentItem(comment) {
    return (tabris_components_1.Composite('.commentContainer', [
        tabris_components_1.Image('.commenterAvatar', comment.user.avatar),
        tabris_components_1.Text('.commentAuthor', comment.user.name),
        tabris_components_1.Text('.commentText', comment.text)
    ]).apply(commentStyling));
}
function NoComments() {
    return (tabris_components_1.Composite('.commentContainer', [
        tabris_components_1.Text('.noComments', 'No comments yet for this item :('),
    ]));
}
var commentStyling = {
    '.commentContainer': styles.stackMargin,
    '.commenterAvatar': {
        left: PAGE_MARGIN,
        top: 10,
        width: 32,
        height: 48,
        scaleMode: "fit"
    },
    '.commentText': {
        left: 64,
        right: PAGE_MARGIN,
        top: "prev()",
        textColor: "#7b7b7b"
    },
    '.commentAuthor': {
        left: 64,
        right: PAGE_MARGIN,
        top: 15,
        textColor: "#000000"
    },
    '.noComments': {
        left: 64,
        right: PAGE_MARGIN,
        top: 15,
        textColor: "#000000",
        font: "bold 16px"
    }
};
/*************************
 * License Pages
 *************************/
var licenseConfig = {
    header: {
        layoutData: { left: PAGE_MARGIN, right: PAGE_MARGIN, top: ["prev()", 10] }
    },
    caption: {
        textColor: "rgba(71, 161, 238, 0.75)",
        layoutData: { left: PAGE_MARGIN, right: PAGE_MARGIN, top: ["prev()", 10] }
    },
    authors: {
        markupEnabled: true,
        layoutData: { left: PAGE_MARGIN, right: PAGE_MARGIN, top: ["prev()", 10] }
    }
};
function openLicensePage() {
    return (tabris_components_1.Page("License", [
        tabris_components_1.Text(texts_1.license.header, licenseConfig.header),
        tabris_components_1.Text(texts_1.license.link.caption, licenseConfig.caption).on("tap", openLicenseWebPage),
        tabris_components_1.Text(texts_1.license.authors, licenseConfig.authors)
    ]).open());
}
function openLicenseWebPage() {
    return (tabris_components_1.Page(texts_1.license.link.caption, [
        tabris_components_1.WebView({
            layoutData: styles.full,
            url: texts_1.license.link.url
        })
    ]).open());
}
/*************************
 * Main
 *************************/
AppNavigationStart();
