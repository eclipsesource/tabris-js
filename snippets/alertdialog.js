// AlertDialog example

new tabris.Button({
  left: 16, top: 'prev() 16', right: 16,
  text: 'Show simple dialog'
}).on('select', function () {
  new tabris.AlertDialog({
    message: 'Your comment has been saved.',
    buttons: {'ok': 'Acknowledge'}
  }).open();
}).appendTo(tabris.ui.contentView);

new tabris.Button({
  left: 16, top: 'prev() 16', right: 16,
  text: 'Show full featured dialog'
}).on('select', function() {
  new tabris.AlertDialog({
    title: 'Conflict while saving',
    message: 'How do you want to resolve the conflict?',
    buttons: {
      'ok': 'Replace',
      'cancel': 'Discard',
      'neutral': 'Keep editing'
    }
  }).on('closeOk', function() {console.log('Replace');})
    .on('closeNeutral', function() {console.log('Keep editing');})
    .on('closeCancel', function() {console.log('Discard');})
    .on('close', function({button}) {console.log('Dialog closed: ' + button);})
    .open();
}).appendTo(tabris.ui.contentView);

new tabris.Button({
  left: 16, top: 'prev() 16', right: 16,
  text: 'Show self closing dialog'
}).on('select', function() {
  var alertDialog = new tabris.AlertDialog({
    message: 'This dialogs closes in 3 seconds.',
    buttons: {'ok': 'OK'}
  }).open();
  setTimeout(function() {alertDialog.close();}, 3000);
}).appendTo(tabris.ui.contentView);
