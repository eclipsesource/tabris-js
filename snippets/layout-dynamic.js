import {Composite, contentView} from 'tabris';

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
}).appendTo(contentView);

new Composite({
  id: 'green',
  background: 'green'
}).appendTo(contentView);

contentView.onResize(applyLayout);
applyLayout();

function applyLayout() {
  const {width, height} = contentView.bounds;
  contentView.apply(height > width ? PORTRAIT : LANDSCAPE);
}
