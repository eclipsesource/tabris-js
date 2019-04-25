import {
  NavigationView,
  ColorValue,
  WidgetCollection,
  Page,
  Selector,
  PropertyChangedEvent,
  Action,
  Properties
} from 'tabris';

let widget: NavigationView = new NavigationView();

// Properties
let actionColor: ColorValue;
let actionTextColor: ColorValue;
let pageAnimation: 'default' | 'none';
let drawerActionVisible: boolean;
let titleTextColor: ColorValue;
let toolbarColor: ColorValue;
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

let properties: Properties<NavigationView> = {
  actionColor, actionTextColor, pageAnimation, drawerActionVisible, titleTextColor, toolbarColor, toolbarVisible
};
widget = new NavigationView(properties);
widget.set(properties);

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

let toolbarHeightChangedEvent: PropertyChangedEvent<NavigationView, number> = {target, timeStamp, type, value};

widget.onToolbarHeightChanged((event: PropertyChangedEvent<NavigationView, number>) => {});

class CustomPage extends Page {
  public foo: string;
}

class CustomAction extends Action {
  public bar: string;
}

const typedNavigationView: NavigationView<CustomPage, CustomAction> = new NavigationView();
typedNavigationView.append(new CustomPage());
typedNavigationView.append(new CustomAction());
const child: CustomPage|CustomAction = typedNavigationView.children()[0];
type = typedNavigationView.pages()[0].foo;

const partialTypedNavigationView: NavigationView<CustomPage> = new NavigationView();
typedNavigationView.append(new CustomPage());
typedNavigationView.append(new CustomAction());
const child2: CustomPage|Action = typedNavigationView.children()[0];
type = typedNavigationView.pages()[0].foo;

class CustomComponent extends NavigationView {
  public foo: string;
  constructor(props: Properties<NavigationView> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});
