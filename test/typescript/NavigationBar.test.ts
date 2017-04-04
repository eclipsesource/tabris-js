import {NavigationBar, Color} from 'tabris';

let navigationBar: NavigationBar = new NavigationBar();

// Properties
let background: Color;
let displayMode: 'default' | 'float' | 'hide';
let height: number;

background = navigationBar.background;
displayMode = navigationBar.displayMode;
height = navigationBar.height;

navigationBar.background = background;
navigationBar.displayMode = displayMode;
