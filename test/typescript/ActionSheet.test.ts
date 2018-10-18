import {ActionSheetItem, ActionSheet, ImageValue, ActionSheetSelectEvent, ActionSheetCloseEvent, Properties} from 'tabris';

let widget: ActionSheet = new ActionSheet();

// Properties
let title: string;
let message: string;
let actions: Array<{title: string, image?: ImageValue, style?: 'default'|'cancel'|'destructive'}>;

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
let index: number, action: ActionSheetItem;
let optionalIndex: number|null, optionalAction: ActionSheetItem|null;
widget
  .onSelect((event: ActionSheetSelectEvent) => {index = event.index; action = event.action; })
  .onClose((event: ActionSheetCloseEvent) => {optionalIndex = event.index; optionalAction = event.action; });

// open
widget = widget.open();
const popup: ActionSheet = ActionSheet.open(widget);
