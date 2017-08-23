import {
  NavigationView,
  Color,
  WidgetCollection,
  Page,
  Selector,
  PropertyChangedEvent,
} from 'tabris';

let widget: NavigationView = new NavigationView;

// Properties
let actionColor: Color;
let actionTextColor: Color;
let pageAnimation: 'default' | 'none';
let drawerActionVisible: boolean;
let titleTextColor: Color;
let toolbarColor: Color;
let toolbarVisible: boolean;

actionColor = widget.actionColor;
actionTextColor = widget.actionTextColor;
pageAnimation = widget.pageAnimation;
drawerActionVisible = widget.drawerActionVisible;
titleTextColor = widget.titleTextColor;
toolbarColor = widget.toolbarColor;
toolbarVisible = widget.toolbarVisible;

widget.actionColor = actionColor;
widget.actionTextColor = actionTextColor;
widget.pageAnimation = pageAnimation;
widget.drawerActionVisible = drawerActionVisible;
widget.titleTextColor = titleTextColor;
widget.toolbarColor = toolbarColor;
widget.toolbarVisible = toolbarVisible;

// Methods
class Foo extends Page {}
let widgetCollection: WidgetCollection<Page>;
let fooCollection: WidgetCollection<Foo>;
let selector: Selector = '';

widgetCollection = widget.pages(selector);
fooCollection = widget.pages(Foo);

// Events
let target: NavigationView = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let value: number = 0;

let bottomToolbarHeightChangedEvent: PropertyChangedEvent<NavigationView, number> = {target, timeStamp, type, value};
let topToolbarHeightChangedEvent: PropertyChangedEvent<NavigationView, number> = {target, timeStamp, type, value};

widget.on({
  bottomToolbarHeightChanged: (event: PropertyChangedEvent<NavigationView, number>) => {},
  topToolbarHeightChanged: (event: PropertyChangedEvent<NavigationView, number>) => {},
});
