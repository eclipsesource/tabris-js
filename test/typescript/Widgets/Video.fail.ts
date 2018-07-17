import {Video} from 'tabris';

let widget = new Video();

const speed = widget.speed;
widget = new Video({speed});
widget.set({speed});
widget.speed = speed;

const position = widget.position;
widget = new Video({position});
widget.set({position});
widget.position = position;

const duration = widget.duration;
widget = new Video({duration});
widget.set({duration});
widget.duration = duration;

const state = widget.state;
widget = new Video({state});
widget.set({state});
widget.state = 'empty';

/*Expected
(6,21): error TS2345
(7,13): error TS2345
'speed' does not exist
(8,8): error TS2540: Cannot assign to 'speed' because it is a constant or a read-only property.

(11,21): error TS2345
(12,13): error TS2345
'position' does not exist
(13,8): error TS2540: Cannot assign to 'position' because it is a constant or a read-only property.

(16,21): error TS2345
(17,13): error TS2345
'duration' does not exist
(18,8): error TS2540: Cannot assign to 'duration' because it is a constant or a read-only property.

(21,21): error TS2345
(22,13): error TS2345
'state' does not exist
(23,8): error TS2540: Cannot assign to 'state' because it is a constant or a read-only property.
*/