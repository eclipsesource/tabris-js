import {StatusBar, ColorValue, statusBar} from 'tabris';

const object: StatusBar = statusBar;

// Properties
let background: ColorValue;
let displayMode: 'default' | 'float' | 'hide';
let height: number;
let theme: 'dark' | 'default' | 'light';

background = statusBar.background;
displayMode = statusBar.displayMode;
height = statusBar.height;
theme = statusBar.theme;

statusBar.background = background;
statusBar.displayMode = displayMode;
statusBar.theme = theme;
