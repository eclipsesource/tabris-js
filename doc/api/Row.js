import {Row, contentView, TextView} from 'tabris';

const row = new Row({
  layoutData: 'stretch',
  spacing: 16
}).appendTo(contentView);

row.append(
  new TextView({text: 'one'}),
  new TextView({text: 'two'}),
  new TextView({text: 'three'})
);
