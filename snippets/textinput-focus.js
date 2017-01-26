new tabris.TextInput({
  top: 20, left: '20%', right: '20%',
  message: 'Colorful typing...',
  font: '22px sans-serif'
}).on('focus', function() {
  this.fillColor = 'yellow';
  this.borderColor = 'yellow';
}).on('blur', function() {
  this.borderColor = 'red';
}).appendTo(tabris.ui.contentView);

new tabris.TextInput({
  top: 'prev() 20', left: '20%', right: '20%',
  message: 'This text field keeps its focus forever',
  keepFocus: true
}).appendTo(tabris.ui.contentView);
