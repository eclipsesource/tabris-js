tabris.load(function() {

  var page = tabris.create("Page", {
    title: "WebView",
    topLevel: true
  });

  var goButton = tabris.create("Button", {
    layoutData: {right: 8, top: 8, width: 64},
    text: "Go"
  }).on("selection", function() {
    webview.set("url", urlInput.get("text"));
  }).appendTo(page);

  var urlInput = tabris.create("Text", {
    layoutData: {left: 8, right: [goButton, 8], top: 8},
    message: "URL",
    text: "http://eclipsesource.com/"
  }).appendTo(page);

  var webview = tabris.create("WebView", {
    layoutData: {left: 0, top: [goButton, 8], right: 0, bottom: 0},
    url: "http://eclipsesource.com/"
  }).appendTo(page);

  page.open();

});
