import {ScrollView} from 'tabris';

let widget = new ScrollView();

const direction = widget.direction;
widget.set({direction});
widget.direction = direction;
widget.on({directionChanged: function() {}});

/*Expected
(8,12): error TS2345:
'directionChanged' does not exist
*/