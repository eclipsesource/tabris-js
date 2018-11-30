import {DateDialog, TextView, Button, ui} from 'tabris';

const FIVE_DAYS = 432000000;

new Button({
  left: 16, right: 16, top: 16,
  text: 'Show DateDialog'
}).on({select: showDateDialog})
  .appendTo(ui.contentView);

const selectionTextView = new TextView({
  left: 16, right: 16, top: ['prev()', 16],
  alignment: 'center'
}).appendTo(ui.contentView);

function showDateDialog() {
  const date = new Date();
  new DateDialog({
    date,
    minDate: new Date(date.getTime() - FIVE_DAYS),
    maxDate: new Date(date.getTime() + FIVE_DAYS)
  }).on({
    select: ev => selectionTextView.text = ev.date,
    close: () => console.log('DateDialog closed')
  }).open();
}
