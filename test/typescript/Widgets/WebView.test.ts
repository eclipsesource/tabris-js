import {
  WebView, EventObject, WebViewNavigateEvent, WebViewDownloadEvent, WebViewMessageEvent, WebViewProperties
} from 'tabris';

let widget: WebView = new WebView();

// Properties
let html: string;
let url: string;
let canGoBack: boolean;
let canGoForward: boolean;

html = widget.html;
url = widget.url;
canGoBack = widget.canGoBack;
canGoForward = widget.canGoForward;

widget.html = html;
widget.url = url;

let properties: WebViewProperties = {html, url};
widget = new WebView(properties);
widget.set(properties);

// Methods
let targetOrigin: string = '';
let message: string = '';
let thisReturnValue: WebView;

thisReturnValue = widget.postMessage(message, targetOrigin);

// Events
let target: WebView = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let contentDisposition: string = 'foo';
let contentLength: number = 42;
let mimeType: string = 'foo';
let preventDefault: () => void = () => {};

let navigateEvent: WebViewNavigateEvent = {target, timeStamp, type, url, preventDefault};
let loadEvent: EventObject<WebView> = {target, timeStamp, type};
let messageEvent: WebViewMessageEvent = {target, timeStamp, type, data};
let downloadEvent: WebViewDownloadEvent = {target, timeStamp, type, contentDisposition, contentLength, mimeType, url};

widget.on({
  navigate: (event: WebViewNavigateEvent) => {},
  load: (event: EventObject<WebView>) => {},
  message: (event: WebViewMessageEvent) => {},
  download: (event: WebViewDownloadEvent) => {}
});
