var PAGE_MARGIN = 16;
var texts_1 = require('./texts');
var books = require("./books.json");
tabris.create("Drawer").append(tabris.create("PageSelector"));
var bookStorePage = createBookListPage("TS Book Store", "images/page_all_books.png", function () { return true; });
createBookListPage("Popular", "images/page_popular_books.png", function (book) { return book.popular; });
createBookListPage("Favorite", "images/page_favorite_books.png", function (book) { return book.favorite; });
tabris.create("Action", {
    title: "Settings",
    image: { src: "images/action_settings.png", scale: 3 }
}).on("select", function () { return openLicensePage; });
bookStorePage.open();
function createBookListPage(title, image, filter) {
    return tabris.create("Page", {
        title: title,
        topLevel: true,
        image: { src: image, scale: 3 }
    }).append(createBooksList(books.filter(filter)));
}
function openBookPage(book) {
    return (Page({ title: book.title }, [
        BookDetails(book),
        TextView({
            layoutData: { height: 1, right: 0, left: 0, top: "prev()" },
            background: "rgba(0, 0, 0, 0.1)"
        }),
        BookTabs(book),
    ]).open());
}
function BookDetails(book) {
    return (Composite({
        background: "white",
        highlightOnTouch: true,
        layoutData: { top: 0, height: 192, left: 0, right: 0 }
    }, [
        ImageView({
            layoutData: { height: 160, width: 106, left: PAGE_MARGIN, top: PAGE_MARGIN },
            image: book.image
        }),
        Composite({ left: ["prev()", PAGE_MARGIN], top: PAGE_MARGIN, right: PAGE_MARGIN }, [
            TextView({
                text: book.title,
                font: "bold 20px",
                layoutData: { left: 0, top: "prev()", right: 0 }
            }),
            TextView({
                layoutData: { left: 0, top: "prev()", right: 0 },
                text: book.author
            }),
            TextView({
                layoutData: { left: 0, top: ["prev()", PAGE_MARGIN] },
                textColor: "rgb(102, 153, 0)",
                text: "EUR 12,95"
            })
        ])
    ]).on("tap", function () { openReadBookPage(book); }));
}
function BookTabs(book) {
    return (TabFolder({
        tabBarLocation: "top",
        paging: true,
        layoutData: { top: "prev()", left: 0, right: 0, bottom: 0 }
    }, [
        // Related Tab
        Tab({ title: "Related" }, [
            createBooksList(books)
        ]),
        // Comments Tab
        Tab({ title: "Comments" }, [
            TextView({
                layoutData: { left: PAGE_MARGIN, top: PAGE_MARGIN, right: PAGE_MARGIN },
                text: "Great Book."
            })
        ])
    ]));
}
function createBooksList(books) {
    return tabris.create("CollectionView", {
        layoutData: { left: 0, right: 0, top: 0, bottom: 0 },
        itemHeight: 72,
        items: books,
        initializeCell: function (cell) {
            var imageView = tabris.create("ImageView", {
                layoutData: { left: PAGE_MARGIN, centerY: 0, width: 32, height: 48 },
                scaleMode: "fit"
            }).appendTo(cell);
            var titleTextView = tabris.create("TextView", {
                layoutData: { left: 64, right: PAGE_MARGIN, top: PAGE_MARGIN },
                markupEnabled: true,
                textColor: "#4a4a4a"
            }).appendTo(cell);
            var authorTextView = tabris.create("TextView", {
                layoutData: { left: 64, right: PAGE_MARGIN, top: [titleTextView, 4] },
                textColor: "#7b7b7b"
            }).appendTo(cell);
            cell.on("change:item", function (widget, book) {
                imageView.set("image", book.image);
                titleTextView.set("text", book.title);
                authorTextView.set("text", book.author);
            });
        }
    }).on("select", function (target, value) { openBookPage(value); });
}
function openReadBookPage(book) {
    return (Page({ title: book.title }, [
        ScrollView({ layoutData: styles.full, direction: "vertical" }, [
            TextView({
                layoutData: { left: PAGE_MARGIN, top: PAGE_MARGIN * 2, right: PAGE_MARGIN },
                textColor: "rgba(0, 0, 0, 0.5)",
                markupEnabled: true,
                text: "<b>" + book.title + "</b>"
            }),
            TextView({
                layoutData: { left: PAGE_MARGIN, right: PAGE_MARGIN, top: ["prev()", PAGE_MARGIN], bottom: PAGE_MARGIN },
                text: texts_1.loremIpsum
            })
        ]),
    ]).open());
}
function openLicensePage() {
    return (Page({ title: "License" }, [
        TextView({ text: texts_1.license.header, layoutData: styles.license.item }),
        TextView({
            text: texts_1.license.link.caption,
            textColor: "rgba(71, 161, 238, 0.75)",
            layoutData: styles.license.item
        }).on("tap", openLicenseWebPage),
        TextView({
            text: texts_1.license.authors,
            markupEnabled: true,
            layoutData: styles.license.item
        }),
    ]).open());
}
function openLicenseWebPage() {
    return (Page({ title: texts_1.license.link.caption }, [
        WebView({
            layoutData: styles.full,
            url: texts_1.license.link.url
        })
    ]).open());
}
var styles = {
    license: {
        item: { left: PAGE_MARGIN, right: PAGE_MARGIN, top: ["prev()", 10] }
    },
    stack: { top: "prev()", left: 0, right: 0 },
    full: { left: 0, top: 0, right: 0, bottom: 0 }
};
function RenderElement(elem, params) {
    if (elem === void 0) { elem = "Composite"; }
    if (params === void 0) { params = {}; }
    return tabris.create(elem, params);
}
function RenderTree(elemName, params, children) {
    if (elemName === void 0) { elemName = "Composite"; }
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    var elem = RenderElement(elemName, params);
    children.forEach(function (child) {
        child.appendTo(elem);
    });
    return elem;
}
function Page(params, children) {
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    return RenderTree("Page", params, children);
}
function WebView(params, children) {
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    return RenderTree("WebView", params, children);
}
function TextView(params, children) {
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    return RenderTree("TextView", params, children);
}
function ScrollView(params, children) {
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    return RenderTree("ScrollView", params, children);
}
function TabFolder(params, children) {
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    return RenderTree("TabFolder", params, children);
}
function Tab(params, children) {
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    return RenderTree("Tab", params, children);
}
function Composite(params, children) {
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    return RenderTree("Composite", params, children);
}
function ImageView(params, children) {
    if (params === void 0) { params = {}; }
    if (children === void 0) { children = []; }
    return RenderTree("ImageView", params, children);
}
