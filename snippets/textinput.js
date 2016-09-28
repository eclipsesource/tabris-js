new tabris.TextInput({
  layoutData: {top: 20, left: '20%', right: '20%'},
  message: 'Type here, then confirm'
}).on('accept', function(widget, text) {
  new tabris.TextView({
    layoutData: {top: 'prev() 20', left: '20%'},
    text: text
  }).appendTo(tabris.ui.contentView);
}).appendTo(tabris.ui.contentView);
