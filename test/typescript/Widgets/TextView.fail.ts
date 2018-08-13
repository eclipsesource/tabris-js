import {TextView} from 'tabris';

let widget = new TextView();

const markupEnabled = widget.markupEnabled;
widget.set({markupEnabled});
widget.markupEnabled = markupEnabled;
widget.onMarkupEnabledChanged(function() {});

/*Expected
(6,
markupEnabled
(7,
markupEnabled
(8,
*/