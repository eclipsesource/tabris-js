// Create a text input field with input finished listener

new tabris.TextInput({
  top: 20, left: '20%', right: '20%',
  message: 'Type here, then confirm'
}).on('accept', function({text}) {
  new tabris.TextView({
    top: 'prev() 20', left: '20%',
    text: text
  }).appendTo(tabris.ui.contentView);
}).appendTo(tabris.ui.contentView);
