import { Picker, TextView, contentView, statusBar, StatusBar } from 'tabris';

const THEMES: Array<StatusBar['theme']> = ['default', 'light', 'dark'];
const DISPLAY_MODES: Array<StatusBar['displayMode']> = ['default', 'float', 'hide'];
const BACKGROUNDS = [statusBar.background, 'rgba(0, 0, 0, 0.25)', 'red', 'green', 'blue'];

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
  itemText: index => `${BACKGROUNDS[index]}`
}).onSelect(({index}) => statusBar.background = BACKGROUNDS[index])
  .appendTo(contentView);

new TextView({
  left: '#displayMode 16', baseline: '#height', right: 16,
  text: `${statusBar.height}`
}).appendTo(contentView);

function createTextView(text: string, id: string) {
  new TextView({
    id,
    left: 16, top: 'prev() 16',
    text
  }).appendTo(contentView);
}

statusBar.onTap(() => console.log('Status bar tapped'));
