import {
  Composite,
  Widget,
  Button,
  WidgetCollection,
  CompositeAddChildEvent,
  CompositeRemoveChildEvent,
  BoxDimensions,
  CompositeProperties,
  Selector
} from 'tabris';

let widget: Composite = new Composite();

// Properties
let padding: BoxDimensions | number;

padding = widget.padding;

widget.padding = padding;

let properties: CompositeProperties = {padding};
widget = new Composite(properties);
widget.set(properties);

// Methods
let widgets: Widget[] = [];
let widgetA: Widget = new Button();
let widgetB: Widget = new Button();
let widgetCollection: WidgetCollection<Widget> = new Composite().find();
let thisReturnValue: Composite;
let fooCollection: WidgetCollection<Widget>;
let selector: Selector = '';
class Foo extends Composite {}

thisReturnValue = widget.append(widgetA, widgetB);
thisReturnValue = widget.append(widgets);
thisReturnValue = widget.append(widgetCollection);
thisReturnValue = widget.apply({'selectorString': properties});
widgetCollection = widget.children();
widgetCollection = widget.children(selector);
fooCollection = widget.children(Foo);
widgetCollection = widget.find();
widgetCollection = widget.find(selector);
fooCollection = widget.find(Foo);

// Events
let target: Composite = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let child: Widget = widgetA;
let index: number = 0;

let addChildEvent: CompositeAddChildEvent = {target, timeStamp, type, child, index};
let removeChildEvent: CompositeRemoveChildEvent = {target, timeStamp, type, child, index};

widget.on({
  addChild: (event: CompositeAddChildEvent) => {},
  removeChild: (event: CompositeRemoveChildEvent) => {}
});
