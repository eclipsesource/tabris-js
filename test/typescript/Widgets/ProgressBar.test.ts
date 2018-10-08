import {ColorValue, ProgressBar, Properties} from 'tabris';

let widget: ProgressBar = new ProgressBar();

// Properties
let maximum: number;
let minimum: number;
let tintColor: ColorValue;
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

let properties: Properties<typeof ProgressBar> = {maximum, minimum, tintColor, selection, state};
widget = new ProgressBar(properties);
widget.set(properties);

class CustomComponent extends ProgressBar {
  public foo: string;
  constructor(props: Properties<typeof ProgressBar> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});
