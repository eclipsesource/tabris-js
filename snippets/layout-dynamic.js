const {Composite, ui} = require('tabris');

const MARGIN = 16;

const PORTRAIT = {
  '#red': {layoutData: {left: MARGIN, top: MARGIN, right: MARGIN, height: '192'}},
  '#green': {layoutData: {left: MARGIN, top: ['#red', MARGIN], right: MARGIN, bottom: MARGIN}}
};

const LANDSCAPE = {
  '#red': {layoutData: {left: MARGIN, top: MARGIN, bottom: MARGIN, width: '192'}},
  '#green': {layoutData: {left: ['#red', MARGIN], top: MARGIN, right: MARGIN, bottom: MARGIN}}
};

new Composite({
  id: 'red',
  background: 'red'
}).appendTo(ui.contentView);

new Composite({
  id: 'green',
  background: 'green'
}).appendTo(ui.contentView);

ui.contentView.on('resize', ({width, height}) => {
  ui.contentView.apply(height > width ? PORTRAIT : LANDSCAPE);
});
