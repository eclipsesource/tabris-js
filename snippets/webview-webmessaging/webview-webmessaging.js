var page = new tabris.Page({
  title: "WebView Web Messaging",
  topLevel: true
});

new tabris.Button({
  left: 16, right: 16, bottom: 16,
  text: "Send message to WebView"
}).on("select", function () {
  webView.postMessage("Hello from Tabris.js", "*");
}).appendTo(page);

var statusTextView = new tabris.TextView({
  left: 16, right: 16, bottom: "prev()", height: 48,
  alignment: "center",
  text: "No message received from WebView"
}).appendTo(page);

new tabris.Composite({
  left: 0, right: 0, bottom: "prev()", height: 1,
  background: "#e1e1e1"
}).appendTo(page);

var webView = new tabris.WebView({
  left: 0, top: 0, right: 0, bottom: "prev()"
}).appendTo(page);

fetch("./website.html").then(function(result) {
  return result.text();
}).then(function(text) {
  webView.set("html", text);
});

webView.on("message", function(widget, event) {
  statusTextView.set("text", "Message received: " + event.data);
});

page.open();
