import {Action, CheckBox, NavigationView, Page, Picker, ScrollView, TextView, contentView, drawer} from 'tabris';

// demonstrates various NavigationView properties

const MARGIN = 16;
const MARGIN_SMALL = 8;
const LABEL_WIDTH = 144;
const COLORS = [null, 'red', 'green', 'blue', 'rgba(0, 0, 0, 0.25)'];

drawer.enabled = true;

const navigationView = new NavigationView({
  left: 0, top: 0, right: 0, height: 144,
  drawerActionVisible: true
}).appendTo(contentView);

const page = new Page({
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
    src: device.platform === 'iOS' ? 'resources/share-black-24dp@3x.png' : 'resources/share-white-24dp@3x.png',
    scale: 3
  }
}).appendTo(navigationView);

const controls = new ScrollView({
  left: 0, right: 0, top: 'prev()', bottom: 0,
  background: 'white',
  elevation: 12
}).appendTo(contentView);

createCheckBox('Show toolbar', ({value: checked}) => {
  navigationView.toolbarVisible = checked;
  toolbarHeightTextView.text = navigationView.toolbarHeight;
});

createCheckBox('Show drawer action', ({value: checked}) => {
  navigationView.drawerActionVisible = checked;
});

createCheckBox('Custom navigation action', ({value: checked}) => {
  if (checked) {
    navigationView.navigationAction = new Action({
      title: 'Close',
      image: {
        src: device.platform === 'iOS' ? 'resources/close-black-24dp@3x.png' : 'resources/close-white-24dp@3x.png',
        scale: 3
      }
    }).on('select', () => console.log('navigationAction selected'));
  } else {
    navigationView.navigationAction = null;
  }
}, false);

createColorPicker('Toolbar color', 'toolbarColor');

createColorPicker('Title text color', 'titleTextColor');

createColorPicker('Action color', 'actionColor');

if (device.platform === 'Android') {
  createColorPicker('Action text color', 'actionTextColor');
}

const toolbarHeightTextView = createTextView('Toolbar height', navigationView.toolbarHeight);

navigationView.on({toolbarHeightChanged: ({value}) => toolbarHeightTextView.text = value});

function createCheckBox(text, listener, checked = true) {
  return new CheckBox({
    left: MARGIN, top: ['prev()', MARGIN_SMALL], right: MARGIN,
    text,
    checked
  }).on('checkedChanged', listener)
    .appendTo(controls);
}

function createColorPicker(text, property) {
  const initialColor = navigationView[property];
  new TextView({
    left: MARGIN, top: ['prev()', MARGIN], width: LABEL_WIDTH,
    text
  }).appendTo(controls);
  new Picker({
    left: ['prev()', MARGIN], baseline: 'prev()', right: MARGIN,
    itemCount: COLORS.length,
    itemText: index => COLORS[index] || initialColor
  }).on({
    select: ({index}) => navigationView[property] = COLORS[index] || initialColor
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
