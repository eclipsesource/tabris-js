var redbox = new tabris.Composite({
  left: 10, top: 10, width: 100, height: 100,
  background: 'red'
}).appendTo(tabris.ui.contentView);

// you can refer to a sibling widget by reference ...

new tabris.Composite({
  id: 'bluebox',
  left: [redbox, 10], top: [redbox, 10], width: 100, height: 100,
  background: 'blue'
}).appendTo(tabris.ui.contentView);

// ... by id ...

new tabris.Composite({
  left: '#bluebox 10', top: '#bluebox 10', width: 100, height: 100,
  background: 'green'
}).appendTo(tabris.ui.contentView);

// ... or by a symbolic reference to the preceeding sibling

new tabris.Composite({
  left: 'prev() 10', top: 'prev() 10', width: 100, height: 100,
  background: 'yellow'
}).appendTo(tabris.ui.contentView);
