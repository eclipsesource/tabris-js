tabris.load(function() {

  var books = [
    ["Schroder: A Novel", "Amity Gaige", "images/book_schroder.jpg"],
    ["Vampires in the Lemon Grove: Stories", "Karen Russell", "images/book_vampires.jpg", false, true],
    ["After Visiting Friends: A Son's Story", "Michael Hainey", "images/book_after_visiting.jpg", true, true],
    ["A History of Future Cities", "Daniel Brook", "images/book_a_history.jpg", true, true],
    ["Autobiography of Us: A Novel", "Aria Beth Sloss", "images/book_autobiografy.jpg", false, true],
    ["How Literature Saved My Life", "David Shields", "images/book_how_literature.jpg", true, false],
    ["The Dinner", "Herman Koch", "images/book_the_dinner.jpg", true, true]
  ].map(function(array) {
    return {
      title: array[0],
      author: array[1],
      image: [array[2], 106, 160],
      popular: array[3],
      favorite: array[4]
    };
  });

  var PAGE_MARGIN = 12;

  function createReadBookPage(book) {
    var page = tabris.createPage({
      title: book.title
    });
    var composite = page.append("ScrollComposite", {
      scroll: "vertical",
      layoutData: { left: 0, right: 0, top: 0, bottom: 0 }
    });
    var titleLabel = composite.append("Label", {
      style: ["WRAP"],
      markupEnabled: true,
      text: "<b>" + book.title + "</b>",
      layoutData: { left: PAGE_MARGIN, top: PAGE_MARGIN * 2, right: PAGE_MARGIN },
      foreground: "rgba(0, 0, 0, 0.5)"
    });
    composite.append("Label", {
      style: ["WRAP"],
      layoutData: { left: PAGE_MARGIN, right: PAGE_MARGIN, top: [titleLabel, PAGE_MARGIN], bottom: PAGE_MARGIN },
      text: "Etiam nisl nisi, egestas quis lacus ut, tristique suscipit metus. In vehicula lectus metus, at accumsan elit fringilla blandit. Integer et quam sed dolor pharetra molestie id eget dui. Donec ac libero eu lectus dapibus placerat eu a tellus. Fusce vulputate ac sem sit amet bibendum. Pellentesque euismod varius purus nec pharetra. Sed vitae ipsum sit amet risus vehicula euismod in at nunc. Sed in viverra arcu, id blandit risus. Praesent sagittis quis nisl id molestie. Donec dignissim, nisl id volutpat consectetur, massa diam aliquam lectus, sed euismod leo elit eu justo. Integer vel ante sapien.\n\nNunc sit amet blandit tellus, sed consequat neque. Proin vel elementum augue. Quisque gravida nulla nisl, at fermentum turpis euismod in. Maecenas vitae tortor at ante vulputate iaculis at vitae sem. Nulla dui erat, viverra eget mauris in, sodales mollis purus. Integer rhoncus suscipit mi in pulvinar. Nam metus augue, dictum a egestas ut, gravida eget ipsum. Nunc sapien nisl, mollis et mauris in, venenatis blandit magna. Nullam scelerisque tellus lacus, in lobortis purus consectetur sed. Etiam pulvinar sapien vel nibh vehicula, in lacinia odio pharetra. Duis tincidunt metus a semper auctor. Sed nec consequat augue, id vulputate orci. Nunc metus nulla, luctus id porttitor nec, interdum sed lacus. Interdum et malesuada fames ac ante ipsum primis in faucibus."
    });
    return page;
  }

  function createBooksPage(title, image, filter) {
    var page = tabris.createPage({
      title: title,
      topLevel: true,
      image: [image, 32, 32]
    });
    createBooksList(page, books.filter(filter));
    return page;
  }

  function createBookPage(book) {
    var page = tabris.createPage({
      title: book.title
    });
    var detailsComposite = page.append("Composite", {
      layoutData: { top: 0, height: 184, left: 0, right: 0 },
      background: "white",
      data: {
        showTouch: true
      }
    });
    detailsComposite.append("Composite", {
      layoutData: { left: 0, right: 0, top: 0, height: 160 + 2 * PAGE_MARGIN }
    }).on("MouseUp", function() {
      createReadBookPage(book).open();
    });
    var imageLabel = detailsComposite.append("Label", {
      layoutData: { height: 160, width: 106, left: PAGE_MARGIN, top: PAGE_MARGIN },
      image: book.image
    });
    var titleLabel = detailsComposite.append("Label", {
      style: ["WRAP"],
      markupEnabled: true,
      text: "<b>" + book.title + "</b>",
      layoutData: { left: [imageLabel, PAGE_MARGIN], top: PAGE_MARGIN, right: PAGE_MARGIN }
    });
    var authorLabel = detailsComposite.append("Label", {
      layoutData: { left: [imageLabel, PAGE_MARGIN], top: [titleLabel, PAGE_MARGIN] },
      text: book.author
    });
    detailsComposite.append("Label", {
      layoutData: { left: [imageLabel, PAGE_MARGIN], top: [authorLabel, PAGE_MARGIN] },
      foreground: "rgb(102, 153, 0)",
      text: "EUR 12,95"
    });
    page.append("Label", {
      layoutData: { height: 1, right: 0, left: 0, top: [detailsComposite, 0] },
      background: "rgba(0, 0, 0, 0.1)"
    });
    var tabFolder = page.append("TabFolder", {
      style: ["TOP"],
      layoutData: { top: [detailsComposite, 0], left: 0, right: 0, bottom: 0 },
      data: {
        paging: true
      }
    });
    var booksList = createBooksList(tabFolder, books);
    tabFolder.append("TabItem", {
      index: 0,
      text: "Related",
      control: booksList
    });
    var tabRelatedComposite = tabFolder.append("Composite", {});
    tabRelatedComposite.append("Label", {
      text: "Great Book.",
      layoutData: { left: PAGE_MARGIN, top: PAGE_MARGIN, right: PAGE_MARGIN, bottom: PAGE_MARGIN }
    });
    tabFolder.append("TabItem", {
      index: 1,
      text: "Comments",
      control: tabRelatedComposite
    });
    return page;
  }

  function createBooksList(parent, books) {
    return parent.append("List", {
      linesVisible: true,
      layoutData: { left: 0, right: 0, top: 0, bottom: 0 },
      itemHeight: 72,
      template: [
        {
          type: "image",
          binding: "image",
          scaleMode: "FIT",
          left: [0, PAGE_MARGIN], top: [0, PAGE_MARGIN], width: 32, height: 48
        },
        {
          type: "text",
          binding: "title",
          left: [0, 56], right: [0, PAGE_MARGIN], top: [0, PAGE_MARGIN], bottom: [0, 0],
          foreground: "rgb(74, 74, 74)"
        },
        {
          type: "text",
          binding: "author",
          left: [0, 56], right: [0, PAGE_MARGIN], top: [0, 36], bottom: [0, 0],
          foreground: "rgb(123, 123, 123)"
        }
      ],
      items: books
    }).on("Selection", function(event) {
      createBookPage(event.item).open();
    });
  }

  function createSettingsPage() {
    var page = tabris.createPage({
      title: "Settings"
    });
    page.append("Label", {
      text: "Settings",
      layoutData: { left: PAGE_MARGIN, right: PAGE_MARGIN, top: PAGE_MARGIN, bottom: PAGE_MARGIN }
    });
    return  page;
  }

  var bookStorePage = createBooksPage("Book Store", "images/page_all_books.png", function() {
    return true;
  });

  createBooksPage("Popular", "images/page_popular_books.png", function(book) {
    return book.popular;
  });

  createBooksPage("Favorite", "images/page_favorite_books.png", function(book) {
    return book.favorite;
  });

  tabris.createAction({
    title: "Settings",
    placementPriority: "LOW",
    image: ["images/action_settings.png", 32, 32]
  }, function() {
    createSettingsPage().open();
  });

  bookStorePage.open();

});
