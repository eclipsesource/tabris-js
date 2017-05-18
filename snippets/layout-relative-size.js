const {Composite, ui} = require('tabris');

new Composite({
  left: 10, top: 10, right: 10, bottom: '70%',
  background: 'red'
}).appendTo(ui.contentView);

new Composite({
  left: 10, top: '30% 10', right: 10, bottom: 10,
  background: 'blue'
}).appendTo(ui.contentView);
