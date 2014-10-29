tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Creating a colored label with centered text",
    topLevel: true
  });

  tabris.create("Label", {
    layoutData: {left: 10, top: 10, right: 10},
    text: "Centered label text",
    alignment: "center",
    background: "#234",
    foreground: "white"
  }).appendTo(page);

  page.open();

});
