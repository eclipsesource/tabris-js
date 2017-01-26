new tabris.TextInput({
  top: 25, left: '20%', right: '20%',
  message: 'default'
}).appendTo(tabris.ui.contentView);

['ascii', 'decimal', 'number', 'numbersAndPunctuation', 'phone', 'email', 'url'].forEach(function(mode) {
  new tabris.TextInput({
    top: 'prev() 10', left: '20%', right: '20%',
    keyboard: mode,
    message: mode
  }).appendTo(tabris.ui.contentView);
});
