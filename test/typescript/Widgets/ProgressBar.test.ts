import {ProgressBar} from 'tabris';

let widget: ProgressBar;

// Parameters
let maximum: number;
let minimum: number;
let selection: number;
let state: 'error' | 'normal' | 'paused';

widget.maximum = maximum;
widget.minimum = minimum;
widget.selection = selection;
widget.state = state;

maximum = widget.maximum;
minimum = widget.minimum;
selection = widget.selection;
state = widget.state;
