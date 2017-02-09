import {AlertDialog} from 'tabris';

let alertDialog: AlertDialog;

// Properties
let buttons: {ok?: string, cancel?: string, neutral?: string};
let message: string;
let title: string;

alertDialog.buttons = buttons;
alertDialog.message = message;
alertDialog.title = title;

buttons = alertDialog.buttons;
message = alertDialog.message;
title = alertDialog.title;

// Methods
let thisReturnValue: AlertDialog;

thisReturnValue = alertDialog.close();
thisReturnValue = alertDialog.open();
