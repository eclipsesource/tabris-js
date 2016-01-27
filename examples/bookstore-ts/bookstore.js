var PAGE_MARGIN = 16;
var tabris_components_1 = require('./tabris-components');
var custom_components_1 = require('./custom-components');
var texts_1 = require('./texts');
var books = require("./books.json");
/*************************
 * Application Start
 *************************/
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
    return (tabris_components_1.CollectionView({
        layoutData: { left: 0, right: 0, top: 0, bottom: 0 },
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
            tabris_components_1.Text({
                layoutData: { left: PAGE_MARGIN, top: PAGE_MARGIN, right: PAGE_MARGIN },
                text: "Great Book."
            })
        ])
    ]));
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
