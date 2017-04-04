import {AlertDialog} from 'tabris';

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

// Methods
let thisReturnValue: AlertDialog;

thisReturnValue = alertDialog.close();
thisReturnValue = alertDialog.open();
