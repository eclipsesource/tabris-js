import {Switch, ColorValue, SwitchSelectEvent, PropertyChangedEvent, Properties} from 'tabris';

let widget: Switch = new Switch();

// Properties
let checked: boolean;
let thumbOffColor: ColorValue;
let thumbOnColor: ColorValue;
let trackOffColor: ColorValue;
let trackOnColor: ColorValue;

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

let properties: Properties<Switch> = {checked, thumbOffColor, thumbOnColor, trackOffColor, trackOnColor};
widget = new Switch(properties);
widget.set(properties);

// Events
let target: Switch = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let value: boolean = false;

let checkedChangedEvent: PropertyChangedEvent<Switch, boolean> = {target, timeStamp, type, value};
let SwitchSelectEvent: SwitchSelectEvent = {target, timeStamp, type, checked};

widget
  .onCheckedChanged((event: PropertyChangedEvent<Switch, boolean>) => {})
  .onSelect((event: SwitchSelectEvent) => {});

class CustomComponent extends Switch {
  public foo: string;
  constructor(props: Properties<Switch> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});
