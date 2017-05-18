const {Action, CheckBox, NavigationView, Page, Picker, ScrollView, TextView, ui} = require('tabris');

// demonstrates various NavigationView properties

const MARGIN = 16;
const MARGIN_SMALL = 8;
const LABEL_WIDTH = 144;
const COLORS = [null, 'red', 'green', 'blue', 'rgba(0, 0, 0, 0.25)'];

ui.drawer.enabled = true;

let navigationView = new NavigationView({
  left: 0, top: 0, right: 0, height: 144,
  drawerActionVisible: true
}).on('topToolbarHeightChanged', ({value: topToolbarHeight}) => {
  topToolbarHeightTextView.text = topToolbarHeight;
}).on('bottomToolbarHeightChanged', ({value: bottomToolbarHeight}) => {
  bottomToolbarHeightTextView.text = bottomToolbarHeight;
}).appendTo(ui.contentView);

let page = new Page({
  title: 'NavigationView',
  background: '#eeeeee'
}).appendTo(navigationView);

new TextView({
  centerX: 0, centerY: 0,
  text: 'Page content'
}).appendTo(page);

new Action({title: 'Search'}).appendTo(navigationView);
new Action({
  title: 'Share',
  image: {
    src: device.platform === 'iOS' ? 'images/share-black-24dp@3x.png' : 'images/share-white-24dp@3x.png',
    scale: 3
  }
}).appendTo(navigationView);

let controls = new ScrollView({
  left: 0, right: 0, top: 'prev()', bottom: 0,
  background: 'white',
  elevation: 12
}).appendTo(ui.contentView);

createCheckBox('Show toolbar', ({value: checked}) => {
  navigationView.toolbarVisible = checked;
  topToolbarHeightTextView.text = navigationView.topToolbarHeight;
  bottomToolbarHeightTextView.text = navigationView.bottomToolbarHeight;
});

createCheckBox('Show drawer action', ({value: checked}) => {
  navigationView.drawerActionVisible = checked;
});

createColorPicker('Toolbar color', 'toolbarColor');

createColorPicker('Title text color', 'titleTextColor');

createColorPicker('Action color', 'actionColor');

if (device.platform === 'Android') {
  createColorPicker('Action text color', 'actionTextColor');
}

let topToolbarHeightTextView = createTextView('Toolbar height top', navigationView.topToolbarHeight);
let bottomToolbarHeightTextView = createTextView('Toolbar height bottom', navigationView.bottomToolbarHeight);

function createCheckBox(text, listener) {
  return new CheckBox({
    left: MARGIN, top: ['prev()', MARGIN_SMALL], right: MARGIN,
    text: text,
    checked: true
  }).on('checkedChanged', listener)
    .appendTo(controls);
}

function createColorPicker(text, property) {
  let initialColor = navigationView.get(property);
  new TextView({
    left: MARGIN, top: ['prev()', MARGIN], width: LABEL_WIDTH,
    text: text
  }).appendTo(controls);
  new Picker({
    left: ['prev()', MARGIN], baseline: 'prev()', right: MARGIN,
    itemCount: COLORS.length,
    itemText: index => COLORS[index] || initialColor
  }).on({
    select: ({index}) => navigationView.set(property, COLORS[index] || initialColor)
  }).appendTo(controls);
}

function createTextView(key, value) {
  new TextView({
    left: MARGIN, top: ['prev()', MARGIN_SMALL], width: LABEL_WIDTH,
    text: key
  }).appendTo(controls);
  return new TextView({
    left: ['prev()', MARGIN], baseline: 'prev()', right: 16, height: 48,
    text: value
  }).appendTo(controls);
}
