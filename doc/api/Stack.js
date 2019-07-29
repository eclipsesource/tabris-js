import {Stack, contentView, TextView} from 'tabris';

const stack = new Stack({
  layoutData: 'stretch',
  spacing: 16
}).appendTo(contentView);

stack.append(
  new TextView({text: 'top'}),
  new TextView({text: 'center'}),
  new TextView({text: 'bottom'})
);
