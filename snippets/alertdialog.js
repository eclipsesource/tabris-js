// AlertDialog example

new tabris.Button({
  left: 16, top: 'prev() 16', right: 16,
  text: 'Show simple dialog'
}).on('select', () => {
  new tabris.AlertDialog({
    message: 'Your comment has been saved.',
    buttons: {ok: 'Acknowledge'}
  }).open();
}).appendTo(tabris.ui.contentView);

new tabris.Button({
  left: 16, top: 'prev() 16', right: 16,
  text: 'Show full featured dialog'
}).on('select', () => {
  new tabris.AlertDialog({
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
}).appendTo(tabris.ui.contentView);

new tabris.Button({
  left: 16, top: 'prev() 16', right: 16,
  text: 'Show self closing dialog'
}).on('select', () => {
  let alertDialog = new tabris.AlertDialog({
    message: 'This dialogs closes in 3 seconds.',
    buttons: {ok: 'OK'}
  }).open();
  setTimeout(() => alertDialog.close(), 3000);
}).appendTo(tabris.ui.contentView);
