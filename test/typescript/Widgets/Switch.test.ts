import {Switch, Color, SwitchSelectEvent} from 'tabris';

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
let target: Switch = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let value: boolean = false;

let SwitchSelectEvent: SwitchSelectEvent = {target, timeStamp, type, checked};

widget.on({
  select: (event: SwitchSelectEvent) => {},
});
