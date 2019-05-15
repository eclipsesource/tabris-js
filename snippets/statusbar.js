import {Picker, TextView, contentView, statusBar} from 'tabris';

/** @type {Array<tabris.StatusBar['theme']>} */
const THEMES = ['default', 'light', 'dark'];
/** @type {Array<tabris.StatusBar['displayMode']>} */
const DISPLAY_MODES = ['default', 'float', 'hide'];
/** @type {Array<string>} */
const BACKGROUNDS = ['initial', 'rgba(0, 0, 0, 0.25)', 'red', 'green', 'blue'];

createTextView('Theme', 'theme');
createTextView('Display mode', 'displayMode');
createTextView('Background', 'background');
createTextView('Height', 'height');

new Picker({
  left: '#displayMode 16', baseline: '#theme', right: 16,
  itemCount: THEMES.length,
  itemText: index => THEMES[index]
}).onSelect(({index}) => statusBar.theme = THEMES[index])
  .appendTo(contentView);

new Picker({
  left: '#displayMode 16', baseline: '#displayMode', right: 16,
  itemCount: DISPLAY_MODES.length,
  itemText: index => DISPLAY_MODES[index]
}).onSelect(({index}) => statusBar.displayMode = DISPLAY_MODES[index])
  .appendTo(contentView);

new Picker({
  left: '#displayMode 16', baseline: '#background', right: 16,
  itemCount: BACKGROUNDS.length,
  itemText: index => BACKGROUNDS[index]
}).onSelect(({index}) => statusBar.background = BACKGROUNDS[index])
  .appendTo(contentView);

new TextView({
  left: '#displayMode 16', baseline: '#height', right: 16,
  text: statusBar.height.toString()
}).appendTo(contentView);

function createTextView(text, id) {
  new TextView({
    id,
    left: 16, top: 'prev() 44',
    text
  }).appendTo(contentView);
}

statusBar.onTap(() => console.log('Status bar tapped'));
