import {TextView, CheckBox, ui} from 'tabris';

const markup = '<b>bold</b>, <i>italic</i>, <big>big</big>, <small>small</small>, ' +
  '<ins>ins</ins>, <del>del</del>, <a href="http://tabrisjs.com">link</a>';

new TextView({
  left: 16, top: 16, right: 16,
  text: 'TextView with markup:\n' + markup
}).appendTo(ui.contentView);

const markupTextView = new TextView({
  left: 16, top: 'prev() 16', right: 16,
  text: 'TextView with markup:\n' + markup,
  markupEnabled: true
}).on('tapLink', ({url}) => console.log(`tab link ${url}`))
  .appendTo(ui.contentView);

new CheckBox({
  left: 16, top: 'prev() 16', right: 16,
  text: 'Render markup',
  checked: markupTextView.markupEnabled
}).on('checkedChanged', ({value: markupEnabled}) => markupTextView.markupEnabled = markupEnabled)
  .appendTo(ui.contentView);
