import {SearchAction, SearchActionInputEvent, SearchActionAcceptEvent, SearchActionProperties} from 'tabris';

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

let properties: SearchActionProperties = {message, text, proposals};
widget = new SearchAction(properties);
widget.set(properties);

// Methods
let voidReturnValue: void;

voidReturnValue = widget.open();

// Events
let target: SearchAction = widget;
let timeStamp: number = 0;
let type: string = 'foo';

let inputEvent: SearchActionInputEvent = {target, timeStamp, type, text};
let acceptEvent: SearchActionAcceptEvent = {target, timeStamp, type, text};

widget.on({
  input: (event: SearchActionInputEvent) => {},
  accept: (event: SearchActionAcceptEvent) => {}
});
