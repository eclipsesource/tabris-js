import {Picker, TextView, ui} from 'tabris';

const THEMES = ['default', 'light', 'dark'];
const DISPLAY_MODES = ['default', 'float', 'hide'];
const BACKGROUNDS = [ui.navigationBar.background, 'rgba(0, 0, 0, 0.25)', 'red', 'green', 'blue'];

createTextView('Theme', 'theme');
createTextView('Display mode', 'displayMode');
createTextView('Background', 'background');
createTextView('Height', 'height');

new Picker({
  left: '#displayMode 16', baseline: '#theme', right: 16,
  itemCount: THEMES.length,
  itemText: index => THEMES[index]
}).on('select', ({index}) => ui.navigationBar.theme = THEMES[index])
  .appendTo(ui.contentView);

new Picker({
  left: '#displayMode 16', baseline: '#displayMode', right: 16,
  itemCount: DISPLAY_MODES.length,
  itemText: index => DISPLAY_MODES[index]
}).on('select', ({index}) => ui.navigationBar.displayMode = DISPLAY_MODES[index])
  .appendTo(ui.contentView);

new Picker({
  left: '#displayMode 16', baseline: '#background', right: 16,
  itemCount: BACKGROUNDS.length,
  itemText: index => BACKGROUNDS[index]
}).on('select', ({index}) => ui.navigationBar.background = BACKGROUNDS[index])
  .appendTo(ui.contentView);

new TextView({
  left: '#displayMode 16', baseline: '#height', right: 16,
  text: ui.navigationBar.height
}).appendTo(ui.contentView);

function createTextView(text, id) {
  new TextView({
    id,
    left: 16, top: 'prev() 16',
    text
  }).appendTo(ui.contentView);
}
