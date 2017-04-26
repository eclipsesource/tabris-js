import {SearchAction} from 'tabris';

let widget: SearchAction = new SearchAction();

// Properties
let message: string;
let proposals: string[];
let text: string;

message = widget.message;
proposals = widget.proposals;
text = widget.text;

widget.message = message;
widget.proposals = proposals;
widget.text = text;

// Methods
let voidReturnValue: void;

voidReturnValue = widget.open();

// Events
widget.on({
  input: event => text = event.text,
  accept: event => text = event.text
});
