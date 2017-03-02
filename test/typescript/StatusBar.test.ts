import {StatusBar, Color} from 'tabris';

let statusBar: StatusBar;

// Properties
let background: Color;
let displayMode: 'default' | 'float' | 'hide';
let height: number;
let theme: 'dark' | 'default' | 'light';

statusBar.background = background;
statusBar.displayMode = displayMode;
statusBar.theme = theme;

background = statusBar.background;
displayMode = statusBar.displayMode;
height = statusBar.height;
theme = statusBar.theme;
