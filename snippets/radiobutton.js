// Create radio buttons with checked handlers

['One', 'Two', 'Three'].forEach(function(title) {
  new tabris.RadioButton({
    left: 10, top: 'prev() 10',
    text: title
  }).on('change:checked', function({target, value: checked}) {
    if (checked) {
      console.log(target.text + ' checked');
    }
  }).appendTo(tabris.ui.contentView);
});
