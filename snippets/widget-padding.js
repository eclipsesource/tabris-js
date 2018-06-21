const {Composite, TextView, ui} = require('tabris');

let composite = new Composite({
  left: 16, right: 16, top: 16,
  background: 'gray',
  padding: 8
}).appendTo(ui.contentView);

new TextView({
  left: 0, top: 0,
  text: 'Tabris.js'
}).appendTo(composite);
