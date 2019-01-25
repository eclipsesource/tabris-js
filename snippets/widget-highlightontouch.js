import {Composite, contentView} from 'tabris';

new Composite({
  left: '30%', top: '30%', right: '30%', bottom: '30%',
  highlightOnTouch: true,
  background: 'gray'
}).appendTo(contentView);
