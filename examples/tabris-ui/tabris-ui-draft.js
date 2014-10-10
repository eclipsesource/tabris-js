tabris.load(function() {

  var red = "#ffc8c8";
  var green = "#c8ffc8";
  var blue = "#c8c8ff";

  var createSubPage = function(title, bgColor) {
    var page = tabris.create("Page", {
      title: title,
      topLevel: false,
      background: bgColor
    });

    var label = tabris.create("Label", {
      layoutData: {left: 10, right: 10, top: 10},
      text: title
    });

    var openButton = tabris.create("Button", {
      text: "open another page",
      layoutData: {left: 10, right: 10, top: [label, 10]}
    }).on("Selection", function() {
      createSubPage(title + "-sub", bgColor).open();
    });

    var closeButton = tabris.create("Button", {
      text: "close this page",
      layoutData: {left: 10, right: 10, top: [openButton, 10]}
    }).on("Selection", function() {
      page.close();
    });

    page.append(label, openButton, closeButton);

    page.on("Dispose", function() {
      pageAction.dispose();
    });

    var pageAction = tabris.createAction({
      title: "Share",
      enabled: true,
      visible: true
    }, function() {});

    return page;
  };

  var createToplevelPage = function(title, bgColor) {
    var page = tabris.createPage({
      title: title,
      topLevel: true,
      background: bgColor
    });

    var label = tabris.create("Label", {
      layoutData: {left: 10, right: 10, top: 10},
      text: title
    });

    var openButton = tabris.create("Button", {
      text: "open page",
      layoutData: {left: 10, right: 10, top: [label, 10]}
    }).on("Selection", function() {
      var subpage = createSubPage(title + "-sub", bgColor);
      subpage.open();
    });

    var closeButton = tabris.create("Button", {
      text: "close this page",
      layoutData: {left: 10, right: 10, top: [openButton, 10]}
    });

    page.append(label, openButton, closeButton);

    closeButton.on("Selection", function() {
      page.close();
    });

    return page;
  };

  var page1 = createToplevelPage("Page One", red);
  createToplevelPage("Page Two", green);
  var page3 = createToplevelPage("Page Three", blue);

  tabris.createAction({
    title: "Page3",
    enabled: true,
    visible: true
  }, function() {
    page3.open();
  });

  page1.open();

});
