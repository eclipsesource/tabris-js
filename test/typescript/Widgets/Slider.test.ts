import {Color, Slider, PropertyChangedEvent, SliderSelectEvent, Properties} from 'tabris';

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

let properties: Properties<typeof Slider> = {maximum, minimum, selection, tintColor};
widget = new Slider(properties);
widget.set(properties);

// Events
let target: Slider = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let value: number = 0;

let sliderSelectionChangedEvent: PropertyChangedEvent<Slider, number> = {target, timeStamp, type, value};
let sliderSelectEvent: SliderSelectEvent = {target, timeStamp, type, selection};

widget
  .onSelectionChanged((event: PropertyChangedEvent<Slider, number>) => {})
  .onSelect((event: SliderSelectEvent) => {});

class CustomComponent extends Slider {
  public foo: string;
  constructor(props: Properties<typeof Slider> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});
