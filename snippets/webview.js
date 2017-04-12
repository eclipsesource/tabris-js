// Create a web view to show a web page

let urlInput = new tabris.TextInput({
  left: 8, right: 8, top: 8,
  message: 'Enter URL...',
  text: 'http://en.wikipedia.org'
}).on('accept', loadUrl)
  .appendTo(tabris.ui.contentView);

let webView = new tabris.WebView({
  left: 0, top: 'prev() 8', right: 0, bottom: 0
}).appendTo(tabris.ui.contentView);

function loadUrl() {
  webView.url = urlInput.text;
}

loadUrl();
