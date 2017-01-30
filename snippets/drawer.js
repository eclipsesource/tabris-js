// Enable the drawer and append a widget to it

var drawer = tabris.ui.drawer;

drawer.enabled = true;

drawer.on('open', function() {
  console.log('drawer opened');
}).on('close', function() {
  console.log('drawer closed');
});

var arrow = String.fromCharCode(8592);
createLabel(arrow + ' Swipe from left or tap here').on('tap', function() {
  drawer.open();
}).appendTo(tabris.ui.contentView);

createLabel('Thank you!').on('tap', function() {
  drawer.close();
}).appendTo(drawer);

function createLabel(text) {
  return new tabris.TextView({
    left: 10, centerY: 0,
    text: text,
    font: '22px Arial'
  });
}
