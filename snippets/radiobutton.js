// Create radio buttons with selection handlers

['One', 'Two', 'Three'].forEach(function(title) {
  new tabris.RadioButton({
    left: 10, top: 'prev() 10',
    text: title
  }).on('change:selection', function({target, value: selected}) {
    if (selected) {
      console.log(target.text + ' selected');
    }
  }).appendTo(tabris.ui.contentView);
});
