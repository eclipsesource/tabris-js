const {Composite, TextView, ui} = require('tabris');

// Create composites and append children to them

let composite1 = new Composite({
  left: 0, top: 0, bottom: 0, right: '50%',
  background: '#f3f3f3'
}).appendTo(ui.contentView);

new TextView({
  left: 0, right: 0, top: '50%',
  alignment: 'center',
  text: 'Composite 1'
}).appendTo(composite1);

let composite2 = new Composite({
  left: '50%', top: 0, bottom: 0, right: 0,
  background: '#eaeaea'
}).appendTo(ui.contentView);

new TextView({
  left: 0, right: 0, top: '50%',
  alignment: 'center',
  text: 'Composite 2'
}).appendTo(composite2);
