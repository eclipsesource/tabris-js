// demonstrates various NavigationView properties

var MARGIN = 16;
var MARGIN_SMALL = 8;

tabris.ui.drawer.enabled = true;

var navigationView = new tabris.NavigationView({
  left: 0, top: 0, right: 0, height: 144,
  drawerActionVisible: true
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
new tabris.Action({title: 'Share', image: 'images/share.png'}).appendTo(navigationView);

var controls = new tabris.ScrollView({
  left: 0, right: 0, top: 'prev()', bottom: 0,
  background: 'white',
  elevation: tabris.device.platform === 'Android' ? 12 : 4
}).appendTo(tabris.ui.contentView);

createCheckBox('Show toolbar', function(checkBox, checked) {
  navigationView.toolbarVisible = checked;
});

createCheckBox('Show drawer action', function(checkBox, checked) {
  navigationView.drawerActionVisible = checked;
});

createColorPicker('Toolbar color', navigationView.toolbarColor, function(picker, color) {
  navigationView.toolbarColor = color;
});

createColorPicker('Title text color', navigationView.titleTextColor, function(picker, color) {
  navigationView.titleTextColor = color;
});

createColorPicker('Action color', navigationView.actionColor, function(picker, color) {
  navigationView.actionColor = color;
});

if (tabris.device.platform === 'Android') {
  createColorPicker('Action text color', navigationView.actionTextColor, function(picker, color) {
    navigationView.actionTextColor = color;
  });
}

function createCheckBox(text, listener) {
  return new tabris.CheckBox({
    left: MARGIN, top: ['prev()', MARGIN_SMALL], right: MARGIN,
    text: text,
    selection: true
  }).on('change:selection', listener)
    .appendTo(controls);
}

function createColorPicker(text, initialColor, listener) {
  new tabris.TextView({
    left: MARGIN, top: ['prev()', MARGIN], width: 114,
    text: text
  }).appendTo(controls);
  new tabris.Picker({
    left: ['prev()', MARGIN], baseline: 'prev()', right: MARGIN,
    items: [initialColor, 'red', 'green', 'blue', 'rgba(0, 0, 0, 0.25)']
  }).on('change:selection', listener)
    .appendTo(controls);
}
