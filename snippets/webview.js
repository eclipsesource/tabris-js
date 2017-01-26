// Create a web view to show a web page

var urlInput = new tabris.TextInput({
  left: 8, right: 8, top: 8,
  message: 'Enter URL...',
  text: 'http://en.wikipedia.org'
}).on('accept', loadUrl).appendTo(tabris.ui.contentView);

var webview = new tabris.WebView({
  layoutData: {left: 0, top: [urlInput, 8], right: 0, bottom: 0}
}).appendTo(tabris.ui.contentView);

function loadUrl() {
  webview.url = urlInput.text;
}

loadUrl();
