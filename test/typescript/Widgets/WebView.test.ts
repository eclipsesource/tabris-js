import {WebView} from 'tabris';

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

// Methods
let targetOrigin: string = '';
let message: string = '';
let thisReturnValue: WebView;

thisReturnValue = widget.postMessage(message, targetOrigin);
