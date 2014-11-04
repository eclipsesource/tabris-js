tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Creating a web view",
    topLevel: true
  });

  var text = tabris.create("Text", {
    layoutData: {left: 8, right: 8, top: 8},
    message: "Enter URL..."
  }).on("accept", function() {
    webview.set("url", this.get("text"));
  }).appendTo(page);

  var webview = tabris.create("WebView", {
    layoutData: {left: 0, top: [text, 8], right: 0, bottom: 0}
  }).appendTo(page);

  page.open();

});
