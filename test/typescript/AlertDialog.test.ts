import {AlertDialog, AlertDialogCloseEvent, EventObject, AlertDialogProperties} from 'tabris';

let alertDialog: AlertDialog = new AlertDialog();

// Properties
let buttons: {ok?: string, cancel?: string, neutral?: string};
let message: string;
let title: string;

buttons = alertDialog.buttons;
message = alertDialog.message;
title = alertDialog.title;

alertDialog.buttons = buttons;
alertDialog.message = message;
alertDialog.title = title;

let properties: AlertDialogProperties = {buttons, message, title};
alertDialog = new AlertDialog(properties);
alertDialog.set(properties);

// Methods
let thisReturnValue: AlertDialog;

thisReturnValue = alertDialog.close();
thisReturnValue = alertDialog.open();

// Events
let target: AlertDialog = alertDialog;
let timeStamp: number = 0;
let type: string = 'foo';
let button: '' | 'ok' | 'cancel' | 'neutral' = 'ok';

let alertDialogCloseEvent: AlertDialogCloseEvent = {target, timeStamp, type, button};
let closeCancelEvent: EventObject<AlertDialog> = {target, timeStamp, type};
let closeNeutralEvent: EventObject<AlertDialog> = {target, timeStamp, type};
let closeOkEvent: EventObject<AlertDialog> = {target, timeStamp, type};

alertDialog.on({
  close: (event: AlertDialogCloseEvent) => {},
  closeCancel: (event: EventObject<AlertDialog>) => {},
  closeNeutral: (event: EventObject<AlertDialog>) => {},
  closeOk: (event: EventObject<AlertDialog>) => {}
});
