var composite1 = new tabris.Composite({
  layoutData: {left: 0, top: 0, bottom: 0, right: '50%'},
  background: '#f3f3f3'
}).appendTo(tabris.ui.contentView);

new tabris.TextView({
  alignment: 'center',
  layoutData: {left: 0, right: 0, top: '50%'},
  text: 'Composite 1'
}).appendTo(composite1);

var composite2 = new tabris.Composite({
  layoutData: {left: [composite1, 0], top: 0, bottom: 0, right: 0},
  background: '#eaeaea'
}).appendTo(tabris.ui.contentView);

new tabris.TextView({
  alignment: 'center',
  layoutData: {left: 0, right: 0, top: '50%'},
  text: 'Composite 2'
}).appendTo(composite2);
