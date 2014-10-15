tabris.load(function() {

  var topLevelPages = [];
  var pages = [];
  var actions = [];

  var createRandomPageId = function() {
    return Math.floor(Math.random() * (99999) + 10000);
  };

  var createPage = function(pageTitle, pageIsTopLevel) {

    var page = tabris.create("Page", {
      title: pageTitle,
      topLevel: pageIsTopLevel
    });

    var addRootPageButton = tabris.create("Button", {
      layoutData: {left: 5, right: 5, top: 5},
      text: "Add Root Page",
      background: "green",
      foreground: "white",
      image: {src: "images/add_root_page.png", width: 24, height: 24}
    }).on("selection", function() {
      var page = createPage("Root Page: " + createRandomPageId(), true);
      topLevelPages.push(page);
      page.open();
    });

    var addPageButton = tabris.create("Button", {
      layoutData: {left: 5, right: 5, top: [addRootPageButton, 5]},
      text: "Add Page",
      background: "green",
      foreground: "white",
      image: {src: "images/add_page.png", width: 24, height: 24}
    }).on("selection", function() {
      var page = createPage("Page: " + createRandomPageId(), false);
      pages.push(page);
      page.open();
    });

    var addGlobalActionButton = tabris.create("Button", {
      layoutData: {left: 5, right: 5, top: [addPageButton, 5]},
      text: "Add Global Action",
      background: "green",
      foreground: "white",
      image: {src: "images/global_action.png", width: 24, height: 24}
    }).on("selection", function() {
      var action = tabris.create("Action", {
        title: "Share",
        image: {src: "images/action_share.png", width: 24, height: 24}
      });
      // TODO: implement action
      actions.push(action);
    });

    // TODO: add page actions to demo when implemented. See tabris-js issue #8.

    var removeLastGlobalActionButton = tabris.create("Button", {
      layoutData: {left: 5, right: 5, bottom: 5},
      text: "Remove Last Global Action",
      background: "red",
      foreground: "white",
      image: {src: "images/global_action.png", width: 24, height: 24}
    }).on("selection", function() {
      if (actions.length - 1 >= 0) {
        actions[actions.length - 1].dispose();
        actions.pop();
      }
    });

    var removeLastRootPageButton = tabris.create("Button", {
      layoutData: {left: 5, right: 5, bottom: [removeLastGlobalActionButton, 5]},
      text: "Remove Last Root Page",
      background: "red",
      foreground: "white",
      image: {src: "images/remove_root_page.png", width: 24, height: 24}
    }).on("selection", function() {
      if (topLevelPages.length - 1 >= 0) {
        topLevelPages[topLevelPages.length - 1].close();
        topLevelPages.pop();
      }
    });

    return page.append(addRootPageButton, addPageButton, addGlobalActionButton,
      removeLastGlobalActionButton, removeLastRootPageButton);
  };

  var topLevelPage = createPage("Dynamic UI Start", true);
  topLevelPage.open();

});
