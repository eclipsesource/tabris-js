import {TextView} from 'tabris';

let widget = new TextView();

const markupEnabled = widget.markupEnabled;
widget.set({markupEnabled});
widget.markupEnabled = markupEnabled;
widget.onMarkupEnabledChanged(function() {});

/*Expected
(6,13): error TS2345
'markupEnabled' does not exist
(7,8): error TS2540: Cannot assign to 'markupEnabled' because it is a constant or a read-only property
(8,8): error TS2339
*/