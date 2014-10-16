tabris.load(function() {

  var page = tabris.create("Page", {
    title: "TabFolder",
    topLevel: true
  });

  page.append(
    tabris.create("TabFolder", {
      layoutData: {left: 0, top: 0, right: 0, bottom: 0},
      paging: true,
      background: "#66cc99",
      foreground: "#2200aa"
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
