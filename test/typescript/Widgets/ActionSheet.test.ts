import {ActionSheet, Image, Color} from 'tabris';

let widget: ActionSheet = new ActionSheet;

// Properties
let title: string;
let message: string;
let actions: {title: string, image?: Image, style?: 'default'|'cancel'|'destructive'}[];

title = widget.title;
message = widget.message;
actions = widget.actions;

widget.title = title;
widget.message = message;
widget.actions = actions;

// Events
let index: number;
widget.on({
  select: event => index = event.index,
  close: event => {}
});
