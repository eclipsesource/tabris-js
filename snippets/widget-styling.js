['normal', 'interactive', 'prio-high', 'missing', 'prio-high missing'].forEach(function(style) {
  new tabris.TextView({
    layoutData: {left: 10, top: 'prev() 10'},
    class: style,
    text: 'class "' + style + '"'
  }).appendTo(tabris.ui.contentView);
});

// This example has inline styles. To re-use styles, you can extract them as modules, e.g.
// tabris.ui.contentView.apply(require("../styles.json));
tabris.ui.contentView.apply({
  'TextView': {font: '24px Arial, sans-serif', textColor: '#333'},
  '.interactive': {textColor: 'blue'},
  '.prio-high': {font: 'bold 24px Arial, Sans-Serif'},
  '.missing': {textColor: '#ccc'}
});
