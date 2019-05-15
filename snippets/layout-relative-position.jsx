import {Composite, contentView, LayoutData, Constraint} from 'tabris';

// There are various ways to refer to other widgets in a constraint value,
// each applicable to string, array or Constraint constructor call expressions

const redbox = new Composite({
  left: 10, top: 10, width: 100, height: 100,
  background: 'red'
}).appendTo(contentView);

// you can refer to a sibling widget by reference ...

new Composite({
  id: 'bluebox',
  left: [redbox, 10], top: new Constraint(redbox, 10), width: 100, height: 100,
  background: 'blue'
}).appendTo(contentView);

// ... by id ...

new Composite({
  left: '#bluebox 10', top: ['#bluebox', 10], width: 100, height: 100,
  background: 'green'
}).appendTo(contentView);

// ... or by a symbolic reference to the preceeding sibling

new Composite({
  left: 'prev() 10', top: [LayoutData.prev, 10], width: 100, height: 100,
  background: 'yellow'
}).appendTo(contentView);
