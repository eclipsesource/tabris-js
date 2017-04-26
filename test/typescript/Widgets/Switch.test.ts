import {Switch, Color} from 'tabris';

let widget: Switch = new Switch();

// Properties
let checked: boolean;
let thumbOffColor: Color;
let thumbOnColor: Color;
let trackOffColor: Color;
let trackOnColor: Color;

checked = widget.checked;
thumbOffColor = widget.thumbOffColor;
thumbOnColor = widget.thumbOnColor;
trackOffColor = widget.trackOffColor;
trackOnColor = widget.trackOnColor;

widget.checked = checked;
widget.thumbOffColor = thumbOffColor;
widget.thumbOnColor = thumbOnColor;
widget.trackOffColor = trackOffColor;
widget.trackOnColor = trackOnColor;

// Events
widget.on({
  checkedChanged: event => checked = event.value,
  select: event => checked = event.checked
});
