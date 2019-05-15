import {ImageView, TextInput, WebView, app, contentView, device} from 'tabris';

const MARGIN = 8;
const NAV_SIZE = device.platform === 'Android' ? 48 : 30;

contentView.set({background: '#f5f5f5'});

const back = new ImageView({
  left: MARGIN, width: NAV_SIZE, height: NAV_SIZE, top: MARGIN,
  highlightOnTouch: true,
  image: {src: 'resources/arrow-back-black-24dp@3x.png', scale: 3}
}).onTap(() => webView.goBack())
  .appendTo(contentView);

const forward = new ImageView({
  left: back, width: NAV_SIZE, height: NAV_SIZE, top: MARGIN,
  highlightOnTouch: true,
  image: {src: 'resources/arrow-forward-black-24dp@3x.png', scale: 3}
}).onTap(() => webView.goForward())
  .appendTo(contentView);

const urlInput = new TextInput({
  id: 'urlInput',
  left: [forward, MARGIN], top: MARGIN, right: MARGIN
}).onAccept(() => webView.url = urlInput.text)
  .appendTo(contentView);

const webView = new WebView({
  left: 0, top: [urlInput, MARGIN], right: 0, bottom: 0,
  url: 'http://en.wikipedia.org'
}).onLoad(updateNavigation)
  .appendTo(contentView);

function updateNavigation() {
  urlInput.text = webView.url;
  updateNavigationButton(back, webView.canGoBack);
  updateNavigationButton(forward, webView.canGoForward);
}

function updateNavigationButton(button, enabled) {
  button.enabled = enabled;
  button.opacity = enabled ? 0.70 : 0.20;
}

app.onBackNavigation((event) => {
  if (webView.canGoBack) {
    webView.goBack();
    event.preventDefault();
  }
});

updateNavigation();
