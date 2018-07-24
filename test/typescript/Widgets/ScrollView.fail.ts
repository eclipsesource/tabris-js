import {ScrollView} from 'tabris';

let widget = new ScrollView();

const direction = widget.direction;
widget.set({direction});
widget.direction = direction;
widget.on({directionChanged: function() {}});

/*Expected
(6,13): error TS2345
'direction' does not exist
(7,8): error TS2540: Cannot assign to 'direction' because it is a constant or a read-only property
(8,12): error TS2345
'directionChanged' does not exist
*/