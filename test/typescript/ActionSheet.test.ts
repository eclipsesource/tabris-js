import {ActionSheet, Image, ActionSheetSelectEvent, EventObject, Properties} from 'tabris';

let widget: ActionSheet = new ActionSheet();

// Properties
let title: string;
let message: string;
let actions: Array<{title: string, image?: Image, style?: 'default'|'cancel'|'destructive'}>;

title = widget.title;
message = widget.message;
actions = widget.actions;

widget.title = title;
widget.message = message;
widget.actions = actions;

let properties: Properties<typeof ActionSheet> = {title, message, actions};
widget = new ActionSheet(properties);
widget.set(properties);

// Events
let index: number;
widget
  .onSelect((event: ActionSheetSelectEvent) => index = event.index)
  .onClose((event: EventObject<ActionSheet>) => {});
