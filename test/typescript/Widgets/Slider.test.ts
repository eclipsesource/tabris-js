import {Slider} from 'tabris';

let widget: Slider = new Slider();

// Properties
let maximum: number;
let minimum: number;
let selection: number;

maximum = widget.maximum;
minimum = widget.minimum;
selection = widget.selection;

widget.maximum = maximum;
widget.minimum = minimum;
widget.selection = selection;
