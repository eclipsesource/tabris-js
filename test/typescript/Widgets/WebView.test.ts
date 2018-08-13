import {
  WebView, EventObject, WebViewNavigateEvent, WebViewDownloadEvent, WebViewMessageEvent,
  PropertyChangedEvent, Properties
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

let properties: Properties<typeof WebView> = {html, url};
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

widget
  .onNavigate((event: WebViewNavigateEvent) => {})
  .onLoad((event: EventObject<WebView>) => {})
  .onMessage((event: WebViewMessageEvent) => {})
  .onDownload((event: WebViewDownloadEvent) => {})
  .onCanGoForwardChanged((event: PropertyChangedEvent<WebView, boolean>) => {})
  .onCanGoBackChanged((event: PropertyChangedEvent<WebView, boolean>) => {});

class CustomComponent extends WebView {
  public foo: string;
  constructor(props: Properties<typeof WebView> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});
