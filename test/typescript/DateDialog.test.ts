import {DateDialog, DateDialogSelectEvent, DateDialogCloseEvent, Properties} from 'tabris';

let dateDialog: DateDialog = new DateDialog();

// Properties
let date: Date;
let minDate: Date;
let maxDate: Date;

date = dateDialog.date;
minDate = dateDialog.minDate;
maxDate = dateDialog.maxDate;

dateDialog.date = date;
dateDialog.minDate = minDate;
dateDialog.maxDate = maxDate;

let properties: Properties<typeof DateDialog> = {date, minDate, maxDate};
dateDialog = new DateDialog(properties);
dateDialog.set(properties);

// Events
let target: DateDialog = dateDialog;
let timeStamp: number = 0;
let type: string = 'foo';

let dateDialogSelectEvent: DateDialogSelectEvent = {target, timeStamp, type, date};

dateDialog
  .onSelect((event: DateDialogSelectEvent) => {})
  .onClose((event: DateDialogCloseEvent) => {});
