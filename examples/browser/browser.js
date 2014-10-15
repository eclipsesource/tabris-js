tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Browser",
    topLevel: true
  });

  var goButton = tabris.create("Button", {
    layoutData: {right: 8, top: 8, width: 64},
    text: "Go"
  });

  var urlInput = tabris.create("Text", {
    layoutData: {left: 8, right: [goButton, 8], top: 8},
    message: "URL",
    text: "http://eclipsesource.com/"
  });

  var browser = tabris.create("rwt.widgets.Browser", {
    layoutData: {left: 0, top: [goButton, 8], right: 0, bottom: 0},
    url: "http://eclipsesource.com/"
  });

  page.append(goButton, urlInput, browser);

  goButton.on("selection", function() {
    browser.set("url", urlInput.get("text"));
  });

  page.open();

});
