import {WebView} from 'tabris';

let widget: WebView = new WebView();

// Properties
let html: string;
let url: string;

html = widget.html;
url = widget.url;

widget.html = html;
widget.url = url;

// Methods
let targetOrigin: string = '';
let message: string = '';
let thisReturnValue: WebView;

thisReturnValue = widget.postMessage(message, targetOrigin);
