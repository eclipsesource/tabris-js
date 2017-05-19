const {Composite, ui} = require('tabris');

new Composite({
  top: 64, width: 200, height: 200, centerX: 0,
  elevation: 8,
  background: 'white'
}).appendTo(ui.contentView);
