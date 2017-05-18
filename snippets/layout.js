const {Composite, ui} = require('tabris');

new Composite({
  left: 20, top: 20, width: 100, height: 100,
  background: 'red'
}).appendTo(ui.contentView);
