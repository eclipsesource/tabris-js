import {ActionSheet, Image, Color, ActionSheetProperties} from 'tabris';

let widget: ActionSheet = new ActionSheet();

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

let properties: ActionSheetProperties = {title, message, actions};
widget = new ActionSheet(properties);
widget.set(properties);

// Events
let index: number;
widget.on({
  select: event => index = event.index,
  close: event => {}
});
