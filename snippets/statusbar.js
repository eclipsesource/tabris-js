const {Picker, TextView, ui} = require('tabris');

const THEMES = ['default', 'light', 'dark'];
const DISPLAY_MODES = ['default', 'float', 'hide'];
const BACKGROUNDS = [ui.statusBar.background, 'rgba(0, 0, 0, 0.25)', 'red', 'green', 'blue'];

createTextView('Theme');

new Picker({
  left: '#displayMode 16', baseline: 'prev()', right: 16,
  itemCount: THEMES.length,
  itemText: index => THEMES[index]
}).on('select', ({index}) => ui.statusBar.theme = THEMES[index])
  .appendTo(ui.contentView);

createTextView('Display mode', 'displayMode');

new Picker({
  left: '#displayMode 16', baseline: 'prev()', right: 16,
  itemCount: DISPLAY_MODES.length,
  itemText: index => DISPLAY_MODES[index]
}).on('select', ({index}) => ui.statusBar.displayMode = DISPLAY_MODES[index])
  .appendTo(ui.contentView);

createTextView('Background');

new Picker({
  left: '#displayMode 16', baseline: 'prev()', right: 16,
  itemCount: BACKGROUNDS.length,
  itemText: index => BACKGROUNDS[index]
}).on('select', ({index}) => ui.statusBar.background = BACKGROUNDS[index])
  .appendTo(ui.contentView);

createTextView('Height');

new TextView({
  left: '#displayMode 16', baseline: 'prev()', right: 16,
  text: ui.statusBar.height
}).appendTo(ui.contentView);

function createTextView(text, id) {
  new TextView({
    id: id,
    left: 16, top: 'prev() 16',
    text: text
  }).appendTo(ui.contentView);
}
