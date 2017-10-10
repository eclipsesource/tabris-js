const {DateDialog, TextView, Button, ui} = require('tabris');

new Button({
  left: 16, right: 16, top: 16,
  text: 'Show DateDialog'
}).on({select: showDateDialog})
  .appendTo(ui.contentView);

let selectionTextView = new TextView({
  left: 16, right: 16, top: ['prev()', 16],
  alignment: 'center'
}).appendTo(ui.contentView);

function showDateDialog() {
  return new DateDialog({
    date: new Date(1507725444000),
    minDate: new Date(1507465725000),
    maxDate: new Date(1510748925000)
  }).on({
    select: ({date}) => selectionTextView.text = date.toString(),
    close: () => console.log('DateDialog closed')
  }).open();
}
