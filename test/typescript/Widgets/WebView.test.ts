import {WebView} from 'tabris';

let widget: WebView;

// Properties
let html: string;
let url: string;

widget.html = html;
widget.url = url;

html = widget.html;
url = widget.url;

// Methods
let targetOrigin: string;
let message: string;
let thisReturnValue: WebView;

thisReturnValue.postMessage(message, targetOrigin);
