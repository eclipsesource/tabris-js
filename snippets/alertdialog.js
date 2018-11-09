import {AlertDialog, Button, TextInput, ui} from 'tabris';

// AlertDialog example

new Button({
  left: 16, top: 'prev() 16', right: 16,
  text: 'Show simple dialog'
}).on('select', () => {
  new AlertDialog({
    title: 'Comment saved',
    buttons: {ok: 'Acknowledge'}
  }).open();
}).appendTo(ui.contentView);

new Button({
  left: 16, top: 'prev() 16', right: 16,
  text: 'Show full featured dialog'
}).on('select', () => {
  new AlertDialog({
    title: 'Conflict while saving',
    message: 'How do you want to resolve the conflict?',
    buttons: {
      ok: 'Replace',
      cancel: 'Discard',
      neutral: 'Keep editing'
    }
  }).on({
    closeOk: () => console.log('Replace'),
    closeNeutral: () => console.log('Keep editing'),
    closeCancel: () => console.log('Discard'),
    close: ({button}) => console.log('Dialog closed: ' + button)
  }).open();
}).appendTo(ui.contentView);

new Button({
  left: 16, top: 'prev() 16', right: 16,
  text: 'Show self closing dialog'
}).on('select', () => {
  const alertDialog = new AlertDialog({
    message: 'This dialogs closes in 3 seconds.',
    buttons: {ok: 'OK'}
  }).open();
  setTimeout(() => alertDialog.close(), 3000);
}).appendTo(ui.contentView);

new Button({
  left: 16, top: 'prev() 16', right: 16,
  text: 'Show text input dialog'
}).on('select', () => new AlertDialog({
  title: 'Sign-in required',
  message: 'Provide sign-in credentials to access your personalized content.',
  buttons: {ok: 'Sign-in', cancel: 'Cancel'},
  textInputs: [new TextInput({message: 'Username'}), new TextInput({message: 'Password', type: 'password'})]
}).on('close', ({target: dialog}) => console.log(`Input: ${dialog.textInputs[0].text} / ${dialog.textInputs[1].text}`))
  .open())
  .appendTo(ui.contentView);
