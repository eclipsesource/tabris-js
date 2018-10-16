import {
  Composite,
  Widget,
  Button,
  WidgetCollection,
  CompositeAddChildEvent,
  CompositeRemoveChildEvent,
  BoxDimensions,
  Selector,
  Properties} from 'tabris';

let widget: Composite = new Composite();

// Properties
let padding: BoxDimensions | number;

padding = widget.padding;

widget.padding = padding;

let properties: Properties<typeof Composite> = {padding};
widget = new Composite(properties);
widget.set(properties);

// Methods
let buttonsComposite: Composite<Button> = new Composite<Button>();
let widgets: Widget[] = [];
let widgetA: Widget = new Button();
let widgetB: Widget = new Button();
let button: Button = new Button();
let widgetCollection: WidgetCollection<Widget> = new Composite().find();
let thisReturnValue: Composite;
let fooCollection: WidgetCollection<Widget>;
let selector: Selector = '';
class Foo extends Composite {}

thisReturnValue = widget.append(widgetA, widgetB);
thisReturnValue = widget.append(widgets);
thisReturnValue = widget.append(widgetCollection);
thisReturnValue = buttonsComposite.append(button);
thisReturnValue = buttonsComposite.append([button]);
thisReturnValue = buttonsComposite.append(new WidgetCollection<Button>([button]));
thisReturnValue = widget.apply({'selectorString': properties});
widgetCollection = widget.children();
button = buttonsComposite.children()[0];
button = buttonsComposite.children(button => button.text === 'foo')[0];
widgetCollection = widget.children(selector);
fooCollection = widget.children(Foo);
widgetCollection = widget.find();
widgetCollection = widget.find(selector);
widgetCollection = buttonsComposite.find(button => button.text === 'foo');
fooCollection = widget.find(Foo);

// Events
let target: Composite = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let child: Widget = widgetA;
let index: number = 0;

let addChildEvent: CompositeAddChildEvent = {target, timeStamp, type, child, index};
let removeChildEvent: CompositeRemoveChildEvent = {target, timeStamp, type, child, index};

widget
  .onAddChild((event: CompositeAddChildEvent) => {})
  .onRemoveChild((event: CompositeRemoveChildEvent) => {});

class CustomComponent extends Composite {
  public foo: string;
  constructor(props: Properties<typeof Composite> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
}

new CustomComponent({foo: 'bar', bar: 'foo'}).set({foo: 'bar', bar: 'foo'});
