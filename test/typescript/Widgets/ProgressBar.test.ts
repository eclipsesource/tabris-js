import {Color, ProgressBar} from 'tabris';

let widget: ProgressBar = new ProgressBar();

// Parameters
let maximum: number;
let minimum: number;
let tintColor: Color;
let selection: number;
let state: 'error' | 'normal' | 'paused';

maximum = widget.maximum;
minimum = widget.minimum;
tintColor = widget.tintColor;
selection = widget.selection;
state = widget.state;

widget.maximum = maximum;
widget.minimum = minimum;
widget.tintColor = tintColor;
widget.selection = selection;
widget.state = state;
