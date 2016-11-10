createTextView('Theme');

new tabris.Picker({
  left: '#displayMode 16', baseline: 'prev()', right: 16,
  items: ['default', 'light', 'dark']
}).on('change:selection', (picker, theme) => tabris.ui.statusBar.theme = theme)
  .appendTo(tabris.ui.contentView);

createTextView('Display mode', 'displayMode');

new tabris.Picker({
  left: '#displayMode 16', baseline: 'prev()', right: 16,
  items: ['default', 'float', 'hide']
}).on('change:selection', (picker, displayMode) => tabris.ui.statusBar.displayMode = displayMode)
  .appendTo(tabris.ui.contentView);

createTextView('Background');

new tabris.Picker({
  left: '#displayMode 16', baseline: 'prev()', right: 16,
  items: [tabris.ui.statusBar.background, 'rgba(0, 0, 0, 0.25)', 'red', 'green', 'blue']
}).on('change:selection', (picker, background) => tabris.ui.statusBar.background = background)
  .appendTo(tabris.ui.contentView);

createTextView('Height');

new tabris.TextView({
  left: '#displayMode 16', baseline: 'prev()', right: 16,
  text: tabris.ui.statusBar.height
}).appendTo(tabris.ui.contentView);

function createTextView(text, id) {
  new tabris.TextView({
    id: id,
    left: 16, top: 'prev() 16',
    text: text
  }).appendTo(tabris.ui.contentView);
}
