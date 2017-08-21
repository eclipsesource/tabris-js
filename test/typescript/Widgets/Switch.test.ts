import {Switch, Color, SwitchSelectEvent, SwitchCheckedChangedEvent} from 'tabris';

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

let checkedChangedEvent: SwitchCheckedChangedEvent = {target, timeStamp, type, value};
let SwitchSelectEvent: SwitchSelectEvent = {target, timeStamp, type, checked};

widget.on({
  checkedChanged: (event: SwitchCheckedChangedEvent) => {},
  select: (event: SwitchSelectEvent) => {},
});
