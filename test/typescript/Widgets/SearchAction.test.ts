import {SearchAction} from 'tabris';

let widget: SearchAction;

// Properties
let message: string;
let proposals: string[];
let text: string;

widget.message = message;
widget.proposals = proposals;
widget.text = text;

message = widget.message;
proposals = widget.proposals;
text = widget.text;

// Methods
let voidReturnValue: void;

voidReturnValue = widget.open();
