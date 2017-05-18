const {Composite, ui} = require('tabris');

let redbox = new Composite({
  left: 10, top: 10, width: 100, height: 100,
  background: 'red'
}).appendTo(ui.contentView);

// you can refer to a sibling widget by reference ...

new Composite({
  id: 'bluebox',
  left: [redbox, 10], top: [redbox, 10], width: 100, height: 100,
  background: 'blue'
}).appendTo(ui.contentView);

// ... by id ...

new Composite({
  left: '#bluebox 10', top: '#bluebox 10', width: 100, height: 100,
  background: 'green'
}).appendTo(ui.contentView);

// ... or by a symbolic reference to the preceeding sibling

new Composite({
  left: 'prev() 10', top: 'prev() 10', width: 100, height: 100,
  background: 'yellow'
}).appendTo(ui.contentView);
