const {TextInput, ui} = require('tabris');

new TextInput({
  top: 24, left: 16, right: 16,
  message: 'Numbers only'
}).on('beforeTextChange', ev => {
  if (!/^[0-9]*$/.test(ev.newValue)) {
    ev.preventDefault();
  }
}).appendTo(ui.contentView);
