createTextView('Display mode', 'displayMode');

new tabris.Picker({
  left: '#displayMode 16', baseline: 'prev()', right: 16,
  items: ['default', 'float', 'hide']
}).on('selectionChanged', function({value: displayMode}) {
  tabris.ui.navigationBar.displayMode = displayMode;
}).appendTo(tabris.ui.contentView);

createTextView('Background');

new tabris.Picker({
  left: '#displayMode 16', baseline: 'prev()', right: 16,
  items: [tabris.ui.navigationBar.background, 'rgba(0, 0, 0, 0.25)', 'red', 'green', 'blue']
}).on('selectionChanged', function({value: background}) {
  tabris.ui.navigationBar.background = background;
}).appendTo(tabris.ui.contentView);

createTextView('Height');

new tabris.TextView({
  left: '#displayMode 16', baseline: 'prev()', right: 16,
  text: tabris.ui.navigationBar.height
}).appendTo(tabris.ui.contentView);

function createTextView(text, id) {
  new tabris.TextView({
    id: id,
    left: 16, top: 'prev() 16',
    text: text
  }).appendTo(tabris.ui.contentView);
}
