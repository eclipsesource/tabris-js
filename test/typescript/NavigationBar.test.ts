import {NavigationBar, Color, ui} from 'tabris';

let navigationBar: NavigationBar = ui.navigationBar;

// Properties
let background: Color;
let displayMode: 'default' | 'float' | 'hide';
let height: number;

background = navigationBar.background;
displayMode = navigationBar.displayMode;
height = navigationBar.height;

navigationBar.background = background;
navigationBar.displayMode = displayMode;
