import {Slider, TextView, contentView} from 'tabris';

// Create a slider with a selection handler

const textView = new TextView({
  left: 10, right: 10, top: '30%',
  alignment: 'centerX',
  font: '22px sans-serif',
  text: '50'
}).appendTo(contentView);

new Slider({
  left: 50, top: [textView, 20], right: 50,
  minimum: -50,
  selection: 50,
  maximum: 150
}).onSelectionChanged(({value}) => textView.text = `${value}`)
  .appendTo(contentView);
