import {TimeDialog, TextView, Button, ui} from 'tabris';

new Button({
  left: 16, right: 16, top: 16,
  text: 'Show TimeDialog'
}).on({select: showTimeDialog})
  .appendTo(ui.contentView);

const selectionTextView = new TextView({
  left: 16, right: 16, top: ['prev()', 16],
  alignment: 'center'
}).appendTo(ui.contentView);

function showTimeDialog() {
  return new TimeDialog({
    date: new Date()
  }).on({
    select: ({date}) => selectionTextView.text = date.toString(),
    close: () => console.log('TimeDialog closed')
  }).open();
}
