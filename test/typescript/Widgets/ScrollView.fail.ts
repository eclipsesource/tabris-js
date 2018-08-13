import {ScrollView} from 'tabris';

let widget = new ScrollView();

const direction = widget.direction;
widget.set({direction});
widget.direction = direction;
widget.onDirectionChanged(function() {});

/*Expected
(6,
direction
(7,
direction
(8,
*/