import {AlertDialog, AlertDialogCloseEvent, EventObject, TextInput, Properties} from 'tabris';

let alertDialog: AlertDialog = new AlertDialog();

// Properties
let buttons: {ok?: string, cancel?: string, neutral?: string};
let textInputs: Array<TextInput> = [new TextInput(), new TextInput()];
let message: string;
let title: string;

buttons = alertDialog.buttons;
message = alertDialog.message;
title = alertDialog.title;
textInputs = alertDialog.textInputs;

alertDialog.buttons = buttons;
alertDialog.message = message;
alertDialog.title = title;
alertDialog.textInputs = textInputs;

let properties: Properties<typeof AlertDialog> = {buttons, message, title, textInputs};
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

alertDialog
  .onClose((event: AlertDialogCloseEvent) => {})
  .onCloseCancel((event: EventObject<AlertDialog>) => {})
  .onCloseNeutral((event: EventObject<AlertDialog>) => {})
  .onCloseOk((event: EventObject<AlertDialog>) => {});
