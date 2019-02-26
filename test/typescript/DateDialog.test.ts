import { DateDialog, DateDialogSelectEvent, DateDialogCloseEvent, Properties } from 'tabris';

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

const properties: Properties<DateDialog> = {date, minDate, maxDate};
dateDialog = new DateDialog(properties);
dateDialog.set(properties);

// Events
const target: DateDialog = dateDialog;
const timeStamp: number = 0;
const type: string = 'foo';

const dateDialogSelectEvent: DateDialogSelectEvent = {target, timeStamp, type, date};

dateDialog
  .onSelect((event: DateDialogSelectEvent) => {})
  .onClose((event: DateDialogCloseEvent) => {});

// open
dateDialog = DateDialog.open();
dateDialog = DateDialog.open(new Date());
dateDialog = DateDialog.open(new DateDialog());
