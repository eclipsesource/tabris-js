import {NavigationBar, Color, Properties, ui} from 'tabris';

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

let properties: Properties<NavigationBar> = {background, displayMode};
navigationBar.set(properties);
