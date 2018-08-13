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
(6,
(7,
speed
(8,
speed

(11,
(12,
position
(13,
position

(16,
(17,
duration
(18,
duration

(21,
(22,
state
(23,
state
*/