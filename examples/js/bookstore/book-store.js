/*jshint unused: false */
(function () {

  function createBook(title, author, image, popular, favorite) {
    return {
      title: title,
      author: author,
      image: [image, 106, 160],
      popular: popular,
      favorite: favorite
    };
  }

  var books = [
    createBook("Schroder: A Novel", "Amity Gaige", "images/book_schroder.jpg"),
    createBook("Vampires in the Lemon Grove: Stories", "Karen Russell", "images/book_vampires.jpg", false, true),
    createBook("After Visiting Friends: A Son's Story", "Michael Hainey", "images/book_after_visiting.jpg", true, true),
    createBook("A History of Future Cities", "Daniel Brook", "images/book_a_history.jpg", true, true),
    createBook("Autobiography of Us: A Novel", "Aria Beth Sloss", "images/book_autobiografy.jpg", false, true),
    createBook("How Literature Saved My Life", "David Shields", "images/book_how_literature.jpg", true, false),
    createBook("The Dinner", "Herman Koch", "images/book_the_dinner.jpg", true, true)
  ];

  var PAGE_MARGIN = 12;

  function createReadBookPage(book) {

    var page = Tabris.createPage({
      title: book.title
    });

    var scrolledComposite = page.append("rwt.widgets.ScrolledComposite", {
      style: ["V_SCROLL"],
      layoutData: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }
    });

    scrolledComposite.append("rwt.widgets.ScrollBar", {
      style: ["VERTICAL"]
    });

    var composite = scrolledComposite.append("rwt.widgets.Composite", {});

    var titleLabel = composite.append("rwt.widgets.Label", {
      style: ["WRAP"],
      markupEnabled: true,
      text: "<b>" + book.title + "</b>",
      layoutData: {
        left: PAGE_MARGIN,
        top: PAGE_MARGIN * 2,
        right: PAGE_MARGIN
      },
      foreground: [0, 0, 0, 128]
    });

    var textLabel = composite.append("rwt.widgets.Label", {
      style: ["WRAP"],
      layoutData: {
        left: PAGE_MARGIN,
        right: PAGE_MARGIN,
        top: [titleLabel.id, PAGE_MARGIN],
        bottom: PAGE_MARGIN
      },
      text: "Etiam nisl nisi, egestas quis lacus ut, tristique suscipit metus. In vehicula lectus metus, at accumsan elit fringilla blandit. Integer et quam sed dolor pharetra molestie id eget dui. Donec ac libero eu lectus dapibus placerat eu a tellus. Fusce vulputate ac sem sit amet bibendum. Pellentesque euismod varius purus nec pharetra. Sed vitae ipsum sit amet risus vehicula euismod in at nunc. Sed in viverra arcu, id blandit risus. Praesent sagittis quis nisl id molestie. Donec dignissim, nisl id volutpat consectetur, massa diam aliquam lectus, sed euismod leo elit eu justo. Integer vel ante sapien.\n\nNunc sit amet blandit tellus, sed consequat neque. Proin vel elementum augue. Quisque gravida nulla nisl, at fermentum turpis euismod in. Maecenas vitae tortor at ante vulputate iaculis at vitae sem. Nulla dui erat, viverra eget mauris in, sodales mollis purus. Integer rhoncus suscipit mi in pulvinar. Nam metus augue, dictum a egestas ut, gravida eget ipsum. Nunc sapien nisl, mollis et mauris in, venenatis blandit magna. Nullam scelerisque tellus lacus, in lobortis purus consectetur sed. Etiam pulvinar sapien vel nibh vehicula, in lacinia odio pharetra. Duis tincidunt metus a semper auctor. Sed nec consequat augue, id vulputate orci. Nunc metus nulla, luctus id porttitor nec, interdum sed lacus. Interdum et malesuada fames ac ante ipsum primis in faucibus."
    });

    scrolledComposite.set("content", composite.id);

    return page;
  }

  function createBooksPage(title, image, filter) {

    var page = Tabris.createPage({
      title: title,
      topLevel: true,
      image: [image, 32, 32]
    });

    var filteredBooks = [];
    for (var i = 0; i < books.length; i++) {
      if (filter(books[i])) {
        filteredBooks.push(books[i]);
      }
    }

    createBooksGrid(page, filteredBooks);

    return page;
  }

  function createBookPage(book) {

    var page = Tabris.createPage({
      title: book.title
    });

    var detailsComposite = page.append("rwt.widgets.Composite", {
      layoutData: {
        height: 184,
        left: 0,
        right: 0
      },
      background: [255, 255, 255],
      data: {
        showTouch: true
      }
    });

    detailsComposite.append("rwt.widgets.Composite", {
      layoutData: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }
    }).on("MouseUp", function () {
      createReadBookPage(book).open();
    });

    var imageLabel = detailsComposite.append("rwt.widgets.Label", {
      layoutData: {
        height: 160,
        width: 106,
        left: PAGE_MARGIN,
        top: PAGE_MARGIN
      },
      image: book.image
    });

    var titleLabel = detailsComposite.append("rwt.widgets.Label", {
      style: ["WRAP"],
      markupEnabled: true,
      text: "<b>" + book.title + "</b>",
      layoutData: {
        left: [imageLabel.id, PAGE_MARGIN],
        top: PAGE_MARGIN,
        right: PAGE_MARGIN
      }
    });

    var authorLabel = detailsComposite.append("rwt.widgets.Label", {
      layoutData: {
        left: [imageLabel.id, PAGE_MARGIN],
        top: [titleLabel.id, PAGE_MARGIN]
      },
      text: book.author
    });

    detailsComposite.append("rwt.widgets.Label", {
      layoutData: {
        left: [imageLabel.id, PAGE_MARGIN],
        top: [authorLabel.id, PAGE_MARGIN]
      },
      foreground: [102, 153, 0],
      text: "EUR 12,95"
    });

    page.append("rwt.widgets.Label", {
      layoutData: {
        height: 1,
        right: 0,
        left: 0,
        top: [detailsComposite.id, 0]
      },
      background: [0, 0, 0, 30]
    });

    var tabFolder = page.append("rwt.widgets.TabFolder", {
      style: ["TOP"],
      layoutData: {
        top: [detailsComposite.id, 0],
        left: 0,
        right: 0,
        bottom: 0
      },
      data: {
        paging: true
      }
    });

    var booksGrid = createBooksGrid(tabFolder, books);

    tabFolder.append("rwt.widgets.TabItem", {
      index: 0,
      text: "Related",
      control: booksGrid.id
    });

    var tabRelatedComposite = tabFolder.append("rwt.widgets.Composite", {});

    tabRelatedComposite.append("rwt.widgets.Label", {
      text: "Great Book.",
      layoutData: {
        left: PAGE_MARGIN,
        top: PAGE_MARGIN,
        right: PAGE_MARGIN,
        bottom: PAGE_MARGIN
      }
    });

    tabFolder.append("rwt.widgets.TabItem", {
      index: 1,
      text: "Comments",
      control: tabRelatedComposite.id
    });

    return page;
  }


  function createBooksGrid(parent, books) {

    var grid = parent.append("rwt.widgets.Grid", {
      itemCount: books.length,
      linesVisible: true,
      layoutData: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      },
      itemHeight: 72,
      rowTemplate: [
        {
          type: "image",
          left: [0, PAGE_MARGIN],
          top: [0, PAGE_MARGIN],
          width: 32,
          height: 48,
          scaleMode: "FIT",
          bindingIndex: 0
        },
        {
          type: "text",
          left: [0, 56],
          right: [0, PAGE_MARGIN],
          top: [0, PAGE_MARGIN],
          bottom: [0, 0],
          bindingIndex: 1,
          foreground: [74, 74, 74, 255]
        },
        {
          type: "text",
          left: [0, 56],
          right: [0, PAGE_MARGIN],
          top: [0, 36],
          bottom: [0, 0],
          bindingIndex: 2,
          foreground: [123, 123, 123, 255]
        }
      ]
    });

    grid.on("Selection", function (event) {
      var gridItem = Tabris._proxies[event.item];
      var index = gridItem.get("index");
      createBookPage(books[index]).open();
    });

    grid.append("rwt.widgets.ScrollBar", {
      style: ["VERTICAL"]
    });

    for (var i = 0; i < books.length; i++) {
      grid.append("rwt.widgets.GridItem", {
        index: i,
        texts: [ "",books[i].title, books[i].author],
        images: [books[i].image, null, null]
      });
    }

    return grid;
  }

  function createSettingsPage() {
    var page = Tabris.createPage({
      title: "Settings"
    });

    page.append("rwt.widgets.Label", {
      text: "Settings",
      layoutData: {
        left: PAGE_MARGIN,
        right: PAGE_MARGIN,
        top: PAGE_MARGIN,
        bottom: PAGE_MARGIN
      }
    });

    return  page;
  }

  var bookStorePage = createBooksPage("Book Store", "images/page_all_books.png", function () {
    return true;
  });

  createBooksPage("Popular", "images/page_popular_books.png", function (book) {
    return book.popular;
  });

  createBooksPage("Favorite", "images/page_favorite_books.png", function (book) {
    return book.favorite;
  });

  Tabris.createAction({
    title: "Settings",
    placementPriority: "LOW",
    image: ["images/action_settings.png", 32, 32]
  }, function () {
    createSettingsPage().open();
  });

  bookStorePage.open();

})();