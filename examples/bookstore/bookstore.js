tabris.load(function() {

  var PAGE_MARGIN = 12;

  var books = [
    ["1984", "H.G. Wells", "images/book_1984.jpg"],
    ["Na Tropie Nieznanych", "Bernard Heuvelmans", "images/book_na_tropie.jpg", false, true],
    ["Stary Czlowiek I Morze", "Ernest Hemingway", "images/book_stary.jpg", true, true],
    ["The Catcher In The Rye", "J.D. Salinger", "images/book_catcher.jpg", true, true],
    ["Moby Dick", "Herman Melville", "images/book_moby_dick.jpg", false, true],
    ["Hobbit", "J.R.R Tolkien", "images/book_hobbit.jpg", true, false],
    ["Wojna Swiatow", "H.G. Wells", "images/book_wojna.jpg", true, true],
    ["Zegar Pomaranczowy Pracz", "Anthony Burgess", "images/book_zegar.jpg", true, true],
    ["Ksiega Dzungli", "Rudyard Kipling", "images/book_ksiega.jpg", true, true]
  ].map(function(array) {
    return {
      title: array[0],
      author: array[1],
      image: {src: array[2], width: 106, height: 160},
      popular: array[3],
      favorite: array[4]
    };
  });

  var loremIpsum = "Etiam nisl nisi, egestas quis lacus ut, tristique suscipit metus. In " +
                   "vehicula lectus metus, at accumsan elit fringilla blandit. Integer et quam " +
                   "sed dolor pharetra molestie id eget dui. Donec ac libero eu lectus dapibus " +
                   "placerat eu a tellus. Fusce vulputate ac sem sit amet bibendum. Pellentesque " +
                   "euismod varius purus nec pharetra. Sed vitae ipsum sit amet risus vehicula " +
                   "euismod in at nunc. Sed in viverra arcu, id blandit risus. Praesent sagittis " +
                   "quis nisl id molestie. Donec dignissim, nisl id volutpat consectetur, massa " +
                   "diam aliquam lectus, sed euismod leo elit eu justo. Integer vel ante " +
                   "sapien.";

  var bookStorePage = createBookListPage("Book Store", "images/page_all_books.png", function() {
    return true;
  });

  createBookListPage("Popular", "images/page_popular_books.png", function(book) {
    return book.popular;
  });

  createBookListPage("Favorite", "images/page_favorite_books.png", function(book) {
    return book.favorite;
  });

  tabris.create("Action", {
    title: "Settings",
    image: {src: "images/action_settings.png", scale: 3}
  }).on("selection", function() {
    createSettingsPage().open();
  });

  bookStorePage.open();

  function createBookListPage(title, image, filter) {
    return tabris.create("Page", {
      title: title,
      topLevel: true,
      image: {src: image, scale: 3 }
    }).append(createBooksList(books.filter(filter)));
  }

  function createBookPage(book) {
    var page = tabris.create("Page", {
      title: book.title
    });
    var detailsComposite = createDetailsView(book)
      .set("layoutData", {top: 0, height: 184, left: 0, right: 0})
      .appendTo(page);
    createTabFolder().set({
      layoutData: {top: [detailsComposite, 0], left: 0, right: 0, bottom: 0}
    }).appendTo(page);
    tabris.create("Label", {
      layoutData: {height: 1, right: 0, left: 0, top: [detailsComposite, 0]},
      background: "rgba(0, 0, 0, 0.1)"
    }).appendTo(page);
    return page;
  }

  function createDetailsView(book) {
    var composite = tabris.create("Composite", {
      background: "white",
      data: {showTouch: true}
    });
    tabris.create("Composite", {
      layoutData: {left: 0, right: 0, top: 0, height: 160 + 2 * PAGE_MARGIN}
    }).on("touchend", function() {
      createReadBookPage(book).open();
    }).appendTo(composite);
    var coverView = tabris.create("ImageView", {
      layoutData: {height: 160, width: 106, left: PAGE_MARGIN, top: PAGE_MARGIN},
      image: book.image
    }).appendTo(composite);
    var titleLabel = tabris.create("Label", {
      markupEnabled: true,
      text: "<b>" + book.title + "</b>",
      layoutData: {left: [coverView, PAGE_MARGIN], top: PAGE_MARGIN, right: PAGE_MARGIN}
    }).appendTo(composite);
    var authorLabel = tabris.create("Label", {
      layoutData: {left: [coverView, PAGE_MARGIN], top: [titleLabel, PAGE_MARGIN]},
      text: book.author
    }).appendTo(composite);
    tabris.create("Label", {
      layoutData: {left: [coverView, PAGE_MARGIN], top: [authorLabel, PAGE_MARGIN]},
      foreground: "rgb(102, 153, 0)",
      text: "EUR 12,95"
    }).appendTo(composite);
    return composite;
  }

  function createTabFolder() {
    var tabFolder = tabris.create("TabFolder", {style: ["TOP"], paging: true});
    var relatedTab = tabris.create("Tab", {title: "Related"}).appendTo(tabFolder);
    createBooksList(books).appendTo(relatedTab);
    var commentsTab = tabris.create("Tab", {title: "Comments"}).appendTo(tabFolder);
    tabris.create("Label", {
      layoutData: {left: PAGE_MARGIN, top: PAGE_MARGIN, right: PAGE_MARGIN, bottom: PAGE_MARGIN},
      text: "Great Book."
    }).appendTo(commentsTab);
    return tabFolder;
  }

  function createBooksList(books) {
    return tabris.create("CollectionView", {
      layoutData: {left: 0, right: 0, top: 0, bottom: 0},
      itemHeight: 72,
      items: books,
      initializeCell: function(cell) {
        var imageView = tabris.create("ImageView", {
          layoutData: {left: [0, PAGE_MARGIN], top: [0, PAGE_MARGIN], width: 32, height: 48},
          scaleMode: "fit"
        }).appendTo(cell);
        var titleLabel = tabris.create("Label", {
          layoutData: {left: [0, 56], right: [0, PAGE_MARGIN], top: [0, PAGE_MARGIN], bottom: [0, 0]},
          foreground: "rgb(74, 74, 74)"
        }).appendTo(cell);
        var authorLabel = tabris.create("Label", {
          layoutData: {left: [0, 56], right: [0, PAGE_MARGIN], top: 36, bottom: 0},
          foreground: "rgb(123, 123, 123)"
        }).appendTo(cell);
        cell.on("itemchange", function(book) {
          imageView.set("image", book.image);
          titleLabel.set("text", book.title);
          authorLabel.set("text", book.author);
        });
      }
    }).on("selection", function(event) {
      createBookPage(event.item).open();
    });
  }

  function createReadBookPage(book) {
    var page = tabris.create("Page", {title: book.title});
    var composite = tabris.create("ScrollComposite", {
      layoutData: {left: 0, right: 0, top: 0, bottom: 0},
      scroll: "vertical"
    }).appendTo(page);
    var titleLabel = tabris.create("Label", {
      layoutData: {left: PAGE_MARGIN, top: PAGE_MARGIN * 2, right: PAGE_MARGIN},
      foreground: "rgba(0, 0, 0, 0.5)",
      markupEnabled: true,
      text: "<b>" + book.title + "</b>"
    }).appendTo(composite);
    tabris.create("Label", {
      layoutData: {left: PAGE_MARGIN, right: PAGE_MARGIN, top: [titleLabel, PAGE_MARGIN], bottom: PAGE_MARGIN},
      text: [loremIpsum, loremIpsum, loremIpsum].join("\n\n")
    }).appendTo(composite);
    return page;
  }

  function createSettingsPage() {
    var page = tabris.create("Page", {
      title: "License"
    });
    var settingsLabel = tabris.create("Label", {
      text: "Book covers come under CC BY 2.0",
      layoutData: {left: PAGE_MARGIN, right: PAGE_MARGIN, top: PAGE_MARGIN}
    }).appendTo(page);
    var linkLabel = tabris.create("Label", {
      text: "<a href=\"https://www.flickr.com/photos/ajourneyroundmyskull/sets/72157626894978086/\">Covers on flickr</a>",
      markupEnabled: true,
      layoutData: {left: PAGE_MARGIN, right: PAGE_MARGIN, top: [settingsLabel, 10]}
    }).appendTo(page);
    tabris.create("Label", {
      text: "<i>Authors of book covers:</i><br/>" +
        "Paula Rodriguez - 1984<br/>" +
        "Marc Storrs and Rob Morphy - Na Tropie Nieznanych<br/>" +
        "Cat Finnie - Stary Czlowiek I Morze<br/>" +
        "Andrew Brozyna - Hobbit<br/>" +
        "Viacheslav Vystupov - Wojna Swiatow<br/>" +
        "Marc Storrs and Rob Morphy - Zegar Pomaranczowy Pracz<br/>" +
        "Andrew Evan Harner - Ksiega Dzungli",
        markupEnabled: true,
      layoutData: {left: PAGE_MARGIN, right: PAGE_MARGIN, top: [linkLabel, 10]}
    }).appendTo(page);
    return page;
  }

});
