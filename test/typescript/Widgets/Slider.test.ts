import {Color, Slider, PropertyChangedEvent, SliderSelectEvent} from 'tabris';

let widget: Slider = new Slider();

// Properties
let maximum: number;
let minimum: number;
let selection: number;
let tintColor: Color;

maximum = widget.maximum;
minimum = widget.minimum;
selection = widget.selection;
tintColor = widget.tintColor;

widget.maximum = maximum;
widget.minimum = minimum;
widget.selection = selection;
widget.tintColor = tintColor;

// Events
let target: Slider = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let value: number = 0;

let sliderSelectionChangedEvent: PropertyChangedEvent<Slider, number> = {target, timeStamp, type, value};
let sliderSelectEvent: SliderSelectEvent = {target, timeStamp, type, selection};

widget.on({
  selectionChanged: (event: PropertyChangedEvent<Slider, number>) => {},
  select: (event: SliderSelectEvent) => {}
});
