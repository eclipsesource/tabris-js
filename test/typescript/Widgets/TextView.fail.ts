import {TextView} from 'tabris';

let widget = new TextView();

const markupEnabled = widget.markupEnabled;
widget.set({markupEnabled});
widget.markupEnabled = markupEnabled;
widget.on({markupEnabledChanged: function() {}});

/*Expected
(8,12): error TS2345
'markupEnabledChanged' does not exist
*/
