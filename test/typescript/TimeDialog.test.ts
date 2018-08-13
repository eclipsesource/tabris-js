import {TimeDialogCloseEvent, TimeDialog, Properties, TimeDialogSelectEvent} from 'tabris';

let timeDialog: TimeDialog = new TimeDialog();

// Properties
let date: Date;

date = timeDialog.date;

timeDialog.date = date;

let properties: Properties<typeof TimeDialog> = {date};
timeDialog = new TimeDialog(properties);
timeDialog.set(properties);

// Events
let target: TimeDialog = timeDialog;
let timeStamp: number = 0;
let type: string = 'foo';

let timeDialogSelectEvent: TimeDialogSelectEvent = {target, timeStamp, type, date};

timeDialog
  .onSelect((event: TimeDialogSelectEvent) => {})
  .onClose((event: TimeDialogCloseEvent) => {});
