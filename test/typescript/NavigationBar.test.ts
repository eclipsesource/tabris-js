import {NavigationBar, Color} from 'tabris';

let navigationBar: NavigationBar;

// Properties
let background: Color;
let displayMode: 'default' | 'float' | 'hide';
let height: number;

navigationBar.background = background;
navigationBar.displayMode = displayMode;

background = navigationBar.background;
displayMode = navigationBar.displayMode;
height = navigationBar.height;
