import {TextView, contentView} from 'tabris';

// Create text views with different alignments

new TextView({
  left: 10, top: 10, right: 10,
  text: 'Left',
  alignment: 'left'
}).appendTo(contentView);

new TextView({
  left: 10, top: 'prev() 10', right: 10,
  text: 'Center',
  alignment: 'centerX'
}).appendTo(contentView);

new TextView({
  left: 10, top: 'prev() 10', right: 10,
  text: 'Right',
  alignment: 'right'
}).appendTo(contentView);
