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
(6,23): error TS2345
(7,13): error TS2345
(8,8): error TS2540: Cannot assign to 'canGoBack' because it is a constant or a read-only property

(11,23): error TS2345
(12,13): error TS2345
(13,8): error TS2540: Cannot assign to 'canGoForward' because it is a constant or a read-only property.
*/
