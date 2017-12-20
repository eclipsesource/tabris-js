import {NavigationBar, Color, ui, NavigationBarProperties} from 'tabris';

let navigationBar: NavigationBar = ui.navigationBar;

// Properties
let background: Color;
let displayMode: 'default' | 'float' | 'hide';
let height: number;
let theme: 'dark' | 'default' | 'light';

background = navigationBar.background;
displayMode = navigationBar.displayMode;
height = navigationBar.height;
theme = navigationBar.theme;

navigationBar.background = background;
navigationBar.displayMode = displayMode;
navigationBar.theme = theme;

let properties: NavigationBarProperties = {background, displayMode};
navigationBar.set(properties);
