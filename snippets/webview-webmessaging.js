import {Button, Composite, TextView, WebView, contentView} from 'tabris';

new Button({
  left: 16, right: 16, bottom: 16,
  text: 'Send message to WebView'
}).on('select', () => webView.postMessage('Hello from Tabris.js', '*'))
  .appendTo(contentView);

const statusTextView = new TextView({
  left: 16, right: 16, bottom: 'prev()', height: 48,
  alignment: 'center',
  text: 'No message received from WebView'
}).appendTo(contentView);

new Composite({
  left: 0, right: 0, bottom: 'prev()', height: 1,
  background: '#e1e1e1'
}).appendTo(contentView);

const webView = new WebView({
  left: 0, top: 0, right: 0, bottom: 'prev()'
}).appendTo(contentView);

fetch('./html/website.html')
  .then(result => result.text())
  .then(text => webView.html = text);

webView.onMessage(({data}) => statusTextView.text = 'Message received: ' + data);
