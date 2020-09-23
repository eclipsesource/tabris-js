import {WebView} from 'tabris';

let widget = new WebView();

const canGoBack = widget.canGoBack;
widget = new WebView({canGoBack});
widget.set({canGoBack});
widget.canGoBack = canGoBack;

const canGoForward = widget.canGoForward;
widget = new WebView({canGoForward});
widget.set({canGoForward});
widget.canGoForward = canGoForward;

/*Expected
(6,
(8,
canGoBack

(11,
(13,
canGoForward
*/
