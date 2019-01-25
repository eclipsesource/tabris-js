import {Composite, contentView} from 'tabris';

new Composite({
  left: 10, top: 10, right: 10, bottom: '70%',
  background: 'red'
}).appendTo(contentView);

new Composite({
  left: 10, top: '30% 10', right: 10, bottom: 10,
  background: 'blue'
}).appendTo(contentView);
