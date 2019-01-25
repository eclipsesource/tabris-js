import {TextView, contentView} from 'tabris';

['normal', 'interactive', 'prio-high', 'missing', 'prio-high missing'].forEach((style) => {
  new TextView({
    left: 10, top: 'prev() 10',
    class: style,
    text: 'class "' + style + '"'
  }).appendTo(contentView);
});

// This example has inline styles. To re-use styles, you can extract them as modules, e.g.
// contentView.apply(require("../styles.json));
contentView.apply({
  'TextView': {font: '24px Arial, sans-serif', textColor: '#333'},
  '.interactive': {textColor: 'blue'},
  '.prio-high': {font: 'bold 24px Arial, Sans-Serif'},
  '.missing': {textColor: '#ccc'}
});
