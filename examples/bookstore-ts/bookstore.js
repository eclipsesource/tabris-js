var PAGE_MARGIN = 16;
var tabris_components_1 = require('./tabris-components');
var custom_components_1 = require('./custom-components');
var texts_1 = require('./texts');
var books = require("./books.json");
var commentsLL = [
    {
        user: {
            name: "Shai Alon",
            avatar: "http://www.gravatar.com/avatar/4dadde84006bb046b49769eed66c7f44?s=200"
        },
        text: "Eric Arthur Blair was an important English writer that you probably already know by the pseudonym of George Orwell. He wrote quite a few books, but many believe that his more influential ones were \"Animal farm\" (1944) and \"1984\" (1948).In those two books he conveyed, metaphorically and not always obviously, what Soviet Russia meant to him.\n            I would like to make some comments about the second book, \"1984\". That book was written near his death, when he was suffering from tuberculosis, what might have had a lot to do with the gloominess that is one of the essential characteristics of \"1984\". The story is set in London, in a nightmarish 1984 that for Orwell might well have been a possibility, writting as he was many years before that date. Or maybe, he was just trying to warn his contemporaries of the dangers of not opposing the Soviet threat, a threat that involved a new way of life that was in conflict with all that the English held dear.\n            Orwell tried to depict a totalitarian state, where the truth didn't exist as such, but was merely what the \"Big Brother\" said it was. Freedom was only total obedience to the Party, and love an alien concept, unless it was love for the Party. The story is told from the point of view of Winston Smith, a functionary of the Ministry of Truth whose work involved the \"correction\" of all records each time the \"Big Brother\" decided that the truth had changed. The Party slogan said that \"Who controls the past controls the future: who controls the present controls the past\", and they applied it constantly by \"bringing up to date\" the past so as to make it coincide with whatever the Party wanted."
    },
    {
        user: {
            name: "Ilya",
            avatar: "http://www.gravatar.com/avatar/b8e2ef5495f109ad48c74f5e732f558c?s=200"
        },
        text: "I think its bad.."
    }
];
/*************************
 * Application Start
 *************************/
function AppNavigationStart() {
    // Drawer Init
    tabris_components_1.Drawer({}, [
        tabris_components_1.PageSelector
    ]);
    // Action init
    tabris_components_1.Action({
        title: "License",
        image: { src: "images/action_settings.png", scale: 3 }
    }).on("select", openLicensePage);
    var bookStorePage = BookListPage("TS Book Store", "images/page_all_books.png", function () { return true; });
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
        BooksList(books.filter(filter)),
    ]));
}
function openBookPage(book) {
    return (tabris_components_1.Page({ title: book.title }, [
        BookDetails(book),
        custom_components_1.Spacer,
        BookTabs(book),
    ]).open());
}
function openReadBookPage(book) {
    return (tabris_components_1.Page({ title: book.title }, [
        tabris_components_1.ScrollView({ layoutData: styles.full, direction: "vertical" }, [
            tabris_components_1.Text({
                layoutData: { left: PAGE_MARGIN, top: PAGE_MARGIN * 2, right: PAGE_MARGIN },
                textColor: "rgba(0, 0, 0, 0.5)",
                font: "bold 20px",
                text: book.title
            }),
            tabris_components_1.Text({
                layoutData: { left: PAGE_MARGIN, right: PAGE_MARGIN, top: ["prev()", PAGE_MARGIN], bottom: PAGE_MARGIN },
                text: texts_1.loremIpsum
            })
        ]),
    ]).open());
}
/*************************
 * Book Sub-components
 *************************/
function BooksList(books) {
    // console.log("Creating book list for "+books.length);
    return (tabris_components_1.CollectionView({
        layoutData: styles.full,
        itemHeight: 72,
        items: books,
        initializeCell: function (cell) {
            [
                tabris_components_1.ImageView({
                    layoutData: { left: PAGE_MARGIN, centerY: 0, width: 32, height: 48 },
                    class: "bookImage",
                    scaleMode: "fit"
                }),
                tabris_components_1.Text({
                    layoutData: { left: 64, right: PAGE_MARGIN, top: PAGE_MARGIN },
                    class: "bookTitle",
                    textColor: "#4a4a4a"
                }),
                tabris_components_1.Text({
                    layoutData: { left: 64, right: PAGE_MARGIN, top: ["prev()", 4] },
                    class: "bookAuthor",
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
    return (tabris_components_1.Composite({
        background: "white",
        highlightOnTouch: true,
        layoutData: { top: 0, height: 192, left: 0, right: 0 }
    }, [
        tabris_components_1.ImageView({
            layoutData: { height: 160, width: 106, left: PAGE_MARGIN, top: PAGE_MARGIN },
            image: book.image
        }),
        tabris_components_1.Composite({ left: ["prev()", PAGE_MARGIN], top: PAGE_MARGIN, right: PAGE_MARGIN }, [
            tabris_components_1.Text({
                text: book.title,
                font: "bold 20px",
                layoutData: { left: 0, top: "prev()", right: 0 }
            }),
            tabris_components_1.Text({
                layoutData: { left: 0, top: "prev()", right: 0 },
                text: book.author
            }),
            tabris_components_1.Text({
                layoutData: { left: 0, top: ["prev()", PAGE_MARGIN] },
                textColor: "rgb(102, 153, 0)",
                text: book.price
            })
        ])
    ]).on("tap", function () { openReadBookPage(book); }));
}
function BookTabs(book) {
    return (tabris_components_1.TabFolder({
        tabBarLocation: "top",
        paging: true,
        layoutData: { top: "prev()", left: 0, right: 0, bottom: 0 }
    }, [
        // Related Tab
        tabris_components_1.Tab({ title: "Related" }, [
            BooksList(books)
        ]),
        // Comments Tab
        tabris_components_1.Tab({ title: "Comments" }, [
            CommentsList(commentsLL)
        ])
    ]));
}
function CommentsList(comments) {
    // console.log("Creating book list for "+books.length);
    return (tabris_components_1.CollectionView({
        layoutData: styles.full,
        itemHeight: 172,
        items: comments,
        initializeCell: function (cell) {
            [
                tabris_components_1.ImageView({
                    layoutData: { left: PAGE_MARGIN, top: 10, width: 32, height: 48 },
                    class: "commenterAvatar",
                    scaleMode: "fit"
                }),
                tabris_components_1.Text({
                    layoutData: { left: 64, right: PAGE_MARGIN, top: 15 },
                    class: "commentAuthor",
                    textColor: "#000000"
                }),
                tabris_components_1.Text({
                    layoutData: { left: 64, right: PAGE_MARGIN, top: "prev()" },
                    class: "commentText",
                    textColor: "#7b7b7b"
                })
            ].forEach(function (elem) { return elem.appendTo(cell); });
            cell.on("change:item", function (widget, comment) {
                cell.children(".commenterAvatar").set("image", comment.user.avatar);
                cell.children(".commentAuthor").set("text", comment.user.name);
                cell.children(".commentText").set("text", comment.text);
            });
        }
    }).on("select", function (target, value) { openBookPage(value); }));
}
/*************************
 * License Pages
 *************************/
function openLicensePage() {
    return (tabris_components_1.Page({ title: "License" }, [
        tabris_components_1.Text({ text: texts_1.license.header, layoutData: styles.license.item }),
        tabris_components_1.Text({
            text: texts_1.license.link.caption,
            textColor: "rgba(71, 161, 238, 0.75)",
            layoutData: styles.license.item
        }).on("tap", openLicenseWebPage),
        tabris_components_1.Text({
            text: texts_1.license.authors,
            markupEnabled: true,
            layoutData: styles.license.item
        }),
    ]).open());
}
function openLicenseWebPage() {
    return (tabris_components_1.Page({ title: texts_1.license.link.caption }, [
        tabris_components_1.WebView({
            layoutData: styles.full,
            url: texts_1.license.link.url
        })
    ]).open());
}
/*************************
 * Styles
 *************************/
var styles = {
    license: {
        item: { left: PAGE_MARGIN, right: PAGE_MARGIN, top: ["prev()", 10] }
    },
    stack: { top: "prev()", left: 0, right: 0 },
    full: { left: 0, top: 0, right: 0, bottom: 0 }
};
/*************************
 * Main
 *************************/
AppNavigationStart();
