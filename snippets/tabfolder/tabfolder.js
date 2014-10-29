tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Creating a tab folder",
    topLevel: true
  });

  page.append(
    tabris.create("TabFolder", {
      layoutData: {left: 0, top: 0, right: 0, bottom: 0},
      paging: true,       // enables swiping through tabs
      background: "#234",
      foreground: "#9ab"
    }).append(
      tabris.create("Tab", {title: "Tab 1", background: "white"}).append(
        tabris.create("Label", {text: "Content of Tab 1"})
      ),
      tabris.create("Tab", {title: "Tab 2", background: "white"}).append(
        tabris.create("Label", {text: "Content of Tab 2"})
      ),
      tabris.create("Tab", {title: "Tab 3", background: "white"}).append(
        tabris.create("Label", {text: "Content of Tab 3"})
      )
    )
  );

  page.open();

});
