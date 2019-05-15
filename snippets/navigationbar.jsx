import {Picker, TextView, contentView, navigationBar, Stack} from 'tabris';

/** @type {Array<tabris.NavigationBar['theme']>} */
const THEMES = ['default', 'light', 'dark'];
/** @type {Array<tabris.NavigationBar['displayMode']>} */
const DISPLAY_MODES = ['default', 'float', 'hide'];
/** @type {Array<string>} */
const BACKGROUNDS = [navigationBar.background.toString(), 'rgba(0, 0, 0, 0.25)', 'red', 'green', 'blue'];

contentView.append(
  <Stack stretch alignment='stretchX' padding={16} spacing={16}>
    <Picker
        message='Theme'
        itemCount={THEMES.length}
        selectionIndex={0}
        itemText={index => THEMES[index]}
        onSelect={ev => navigationBar.theme = THEMES[ev.index]}/>
    <Picker
        message='Display Mode'
        itemCount={DISPLAY_MODES.length}
        selectionIndex={0}
        itemText={index => DISPLAY_MODES[index]}
        onSelect={ev => navigationBar.displayMode = DISPLAY_MODES[ev.index]}/>
    <Picker
        message='Background'
        itemCount={BACKGROUNDS.length}
        selectionIndex={0}
        itemText={index => BACKGROUNDS[index]}
        onSelect={ev => navigationBar.background = BACKGROUNDS[ev.index]}/>
    <TextView>Height: {navigationBar.height.toString()}</TextView>
  </Stack>
);
