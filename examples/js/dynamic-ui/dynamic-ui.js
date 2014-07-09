tabris.load(function() {

  var red = [210, 50, 20];
  var green = [0, 128, 0];

  var topLevelPages = [];
  var pages = [];
  var actions = [];

  var createRandomPageId = function() {
    return Math.floor(Math.random() * (99999) + 10000);
  };

  var createPage = function(pageTitle, pageIsTopLevel) {

    var page = tabris.createPage({
      title: pageTitle,
      topLevel: pageIsTopLevel
    });

    var addRootPageButton = page.append("Button", {
      layoutData: {left: 5, right: 5, top: 5},
      text: "Add Root Page",
      background: green,
      foreground: [255, 255, 255],
      image: ["images/add_root_page.png", 24, 24]
    });

    addRootPageButton.on("Selection", function() {
      var page = createPage("Root Page: " + createRandomPageId(), true);
      topLevelPages.push(page);
      page.open();
    });

    var addPageButton = page.append("Button", {
      layoutData: {left: 5, right: 5, top: [addRootPageButton, 5]},
      text: "Add Page",
      background: green,
      foreground: [255, 255, 255],
      image: ["images/add_page.png", 24, 24]
    });

    addPageButton.on("Selection", function() {
      var page = createPage("Page: " + createRandomPageId(), false);
      pages.push(page);
      page.open();
    });

    var addGlobalActionButton = page.append("Button", {
      layoutData: {left: 5, right: 5, top: [addPageButton, 5]},
      text: "Add Global Action",
      background: green,
      foreground: [255, 255, 255],
      image: ["images/global_action.png", 24, 24]
    });

    addGlobalActionButton.on("Selection", function() {
      var action = tabris.createAction({
        title: "Share",
        image: ["images/action_share.png", 24, 24]
      }, function() {
        // TODO: implement action
      });
      actions.push(action);
    });

    // TODO: add page actions to demo when implemented. See tabris-js issue #8.

    var removeLastGlobalActionButton = page.append("Button", {
      layoutData: {left: 5, right: 5, bottom: 5},
      text: "Remove Last Global Action",
      background: red,
      foreground: [255, 255, 255],
      image: ["images/global_action.png", 24, 24]
    });

    removeLastGlobalActionButton.on("Selection", function() {
      if (actions.length - 1 >= 0) {
        actions[actions.length - 1].dispose();
        actions.pop();
      }
    });

    var removeLastRootPageButton = page.append("Button", {
      layoutData: {left: 5, right: 5, bottom: [removeLastGlobalActionButton, 5]},
      text: "Remove Last Root Page",
      background: red,
      foreground: [255, 255, 255],
      image: ["images/remove_root_page.png", 24, 24]
    });

    removeLastRootPageButton.on("Selection", function() {
      if (topLevelPages.length - 1 >= 0) {
        topLevelPages[topLevelPages.length - 1].close();
        topLevelPages.pop();
      }
    });

    return page;
  };

  var topLevelPage = createPage("Dynamic UI Start", true);
  topLevelPage.open();

});