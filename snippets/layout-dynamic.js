var MARGIN = 16;

var PORTRAIT = {
  '#red': {layoutData: {left: MARGIN, top: MARGIN, right: MARGIN, height: '192'}},
  '#green': {layoutData: {left: MARGIN, top: ['#red', MARGIN], right: MARGIN, bottom: MARGIN}}
};

var LANDSCAPE = {
  '#red': {layoutData: {left: MARGIN, top: MARGIN, bottom: MARGIN, width: '192'}},
  '#green': {layoutData: {left: ['#red', MARGIN], top: MARGIN, right: MARGIN, bottom: MARGIN}}
};

new tabris.Composite({
  id: 'red',
  background: 'red'
}).appendTo(tabris.ui.contentView);

new tabris.Composite({
  id: 'green',
  background: 'green'
}).appendTo(tabris.ui.contentView);

tabris.ui.contentView.on('resize', function({width, height}) {
  tabris.ui.contentView.apply(height > width ? PORTRAIT : LANDSCAPE);
});
