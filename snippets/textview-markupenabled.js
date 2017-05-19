const {TextView, ui} = require('tabris');

let markup = '<b>bold</b>, <i>italic</i>, <big>big</big>, <small>small</small>, ' +
             '<ins>ins</ins>, <del>del</del>, <a>link</a>';

new TextView({
  left: 10, top: 10, right: 10,
  text: 'TextView with markup not enabled:\n' + markup
}).appendTo(ui.contentView);

new TextView({
  left: 10, top: 'prev() 30', right: 10,
  text: 'TextView with markup enabled:\n' + markup,
  markupEnabled: true
}).appendTo(ui.contentView);
