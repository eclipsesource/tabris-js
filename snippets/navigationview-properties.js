// demonstrates various NavigationView properties

var MARGIN = 16;
var MARGIN_SMALL = 8;
var LABEL_WIDTH = 144;

tabris.ui.drawer.enabled = true;

var navigationView = new tabris.NavigationView({
  left: 0, top: 0, right: 0, height: 144,
  drawerActionVisible: true
}).on('change:topToolbarHeight', function({value: topToolbarHeight}) {
  topToolbarHeightTextView.text = topToolbarHeight;
}).on('change:bottomToolbarHeight', function({value: bottomToolbarHeight}) {
  bottomToolbarHeightTextView.text = bottomToolbarHeight;
}).appendTo(tabris.ui.contentView);

var page = new tabris.Page({
  title: 'NavigationView',
  background: '#eeeeee'
}).appendTo(navigationView);

new tabris.TextView({
  centerX: 0, centerY: 0,
  text: 'Page content'
}).appendTo(page);

new tabris.Action({title: 'Search'}).appendTo(navigationView);
new tabris.Action({
  title: 'Share',
  image: {
    src: tabris.device.platform === 'iOS' ? 'images/share-black-24dp@3x.png' : 'images/share-white-24dp@3x.png',
    scale: 3
  }
}).appendTo(navigationView);

var controls = new tabris.ScrollView({
  left: 0, right: 0, top: 'prev()', bottom: 0,
  background: 'white',
  elevation: 12
}).appendTo(tabris.ui.contentView);

createCheckBox('Show toolbar', function({value: checked}) {
  navigationView.toolbarVisible = checked;
  topToolbarHeightTextView.text = navigationView.topToolbarHeight;
  bottomToolbarHeightTextView.text = navigationView.bottomToolbarHeight;
});

createCheckBox('Show drawer action', function({value: checked}) {
  navigationView.drawerActionVisible = checked;
});

createColorPicker('Toolbar color', navigationView.toolbarColor, function({value: color}) {
  navigationView.toolbarColor = color;
});

createColorPicker('Title text color', navigationView.titleTextColor, function({value: color}) {
  navigationView.titleTextColor = color;
});

createColorPicker('Action color', navigationView.actionColor, function({value: color}) {
  navigationView.actionColor = color;
});

if (tabris.device.platform === 'Android') {
  createColorPicker('Action text color', navigationView.actionTextColor, function({value: color}) {
    navigationView.actionTextColor = color;
  });
}

var topToolbarHeightTextView = createTextView('Toolbar height top', navigationView.topToolbarHeight);
var bottomToolbarHeightTextView = createTextView('Toolbar height bottom', navigationView.bottomToolbarHeight);

function createCheckBox(text, listener) {
  return new tabris.CheckBox({
    left: MARGIN, top: ['prev()', MARGIN_SMALL], right: MARGIN,
    text: text,
    checked: true
  }).on('change:checked', listener)
    .appendTo(controls);
}

function createColorPicker(text, initialColor, listener) {
  new tabris.TextView({
    left: MARGIN, top: ['prev()', MARGIN], width: LABEL_WIDTH,
    text: text
  }).appendTo(controls);
  new tabris.Picker({
    left: ['prev()', MARGIN], baseline: 'prev()', right: MARGIN,
    items: [initialColor, 'red', 'green', 'blue', 'rgba(0, 0, 0, 0.25)']
  }).on('change:selection', listener)
    .appendTo(controls);
}

function createTextView(key, value) {
  new tabris.TextView({
    left: MARGIN, top: ['prev()', MARGIN_SMALL], width: LABEL_WIDTH,
    text: key
  }).appendTo(controls);
  return new tabris.TextView({
    left: ['prev()', MARGIN], baseline: 'prev()', right: 16, height: 48,
    text: value
  }).appendTo(controls);
}
