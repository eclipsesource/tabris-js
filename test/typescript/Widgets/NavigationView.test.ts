import {NavigationView, Color, WidgetCollection} from 'tabris';

let widget: NavigationView = new NavigationView;

// Properties
let actionColor: Color;
let actionTextColor: Color;
let animated: boolean;
let drawerActionVisible: boolean;
let titleTextColor: Color;
let toolbarColor: Color;
let toolbarVisible: boolean;

actionColor = widget.actionColor;
actionTextColor = widget.actionTextColor;
animated = widget.animated;
drawerActionVisible = widget.drawerActionVisible;
titleTextColor = widget.titleTextColor;
toolbarColor = widget.toolbarColor;
toolbarVisible = widget.toolbarVisible;

widget.actionColor = actionColor;
widget.actionTextColor = actionTextColor;
widget.animated = animated;
widget.drawerActionVisible = drawerActionVisible;
widget.titleTextColor = titleTextColor;
widget.toolbarColor = toolbarColor;
widget.toolbarVisible = toolbarVisible;

// Methods
let widgetCollection: WidgetCollection;

widgetCollection = widget.pages();
