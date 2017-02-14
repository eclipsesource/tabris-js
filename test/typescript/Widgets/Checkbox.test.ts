import {CheckBox} from 'tabris';

let widget: CheckBox;

// Properties
let selection: boolean;
let text: string;

widget.selection = selection;
widget.text = text;

selection = widget.selection;
text = widget.text;

// Events

widget.on('change:selection', (event) => {
  let self: CheckBox = event.target;
  let selection: boolean = event.value;
});
