import {Color, Slider, SliderSelectionChangedEvent, SliderSelectEvent} from 'tabris';

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

let sliderSelectEvent: SliderSelectEvent = {target, timeStamp, type, selection};
let sliderSelectionChangedEvent: SliderSelectionChangedEvent = {target, timeStamp, type, value};

widget.on({
  selectionChanged: (event: SliderSelectionChangedEvent) => {},
  select: (event: SliderSelectEvent) => {}
});
