tabris.load(function() {

  var page = tabris.createPage({
    title: "Browser",
    topLevel: true
  });

  var goButton = page.append("Button", {
    layoutData: {right: 8, top: 8, width: 64},
    text: "Go"
  });

  var urlInput = page.append("Text", {
    layoutData: {left: 8, right: [goButton, 8], top: 8},
    message: "URL",
    text: "http://eclipsesource.com/"
  });

  var browser = page.append("rwt.widgets.Browser", {
    layoutData: {left: 0, top: [goButton, 8], right: 0, bottom: 0},
    url: "http://eclipsesource.com/"
  });

  goButton.on("Selection", function() {
    browser.set("url", urlInput.get("text"));
  });

  page.open();

});