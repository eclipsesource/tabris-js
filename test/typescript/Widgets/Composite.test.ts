import {
  Composite,
  Widget,
  Button,
  WidgetCollection,
  CompositeAddChildEvent,
  CompositeRemoveChildEvent,
  BoxDimensions,
  Selector,
  Properties,
  Layout,
  Set
} from 'tabris';

let widget: Composite = new Composite();

// Properties
const padding: BoxDimensions | number | null = widget.padding;

const properties: Properties<Composite> = {padding};
widget = new Composite(properties);
widget.set(properties);

// Methods
const buttonsComposite: Composite<Button> = new Composite<Button>();
const widgets: Widget[] = [];
const widgetA: Widget = new Button();
const widgetB: Widget = new Button();
let button: Button = new Button();
let widgetCollection: WidgetCollection<Widget> = new Composite().find();
let thisReturnValue: Composite;
let fooCollection: WidgetCollection<Foo>;
const selector: Selector = '';
class Foo extends Composite { public test: string; }
const Bar = () => new Foo();

thisReturnValue = widget.append(widgetA, widgetB);
thisReturnValue = widget.append(widgets);
thisReturnValue = widget.append(widgetCollection);
thisReturnValue = buttonsComposite.append(button);
thisReturnValue = buttonsComposite.append([button]);
thisReturnValue = buttonsComposite.append(new WidgetCollection<Button>([button]));
thisReturnValue = widget.apply({selectorString: properties});
thisReturnValue = widget.apply({selectorString: Set(Button, {text: 'foo', onSelect: ev => console.log(ev.type)})});
thisReturnValue = widget.apply('default', {selectorString: properties});
thisReturnValue = widget.apply('strict', {selectorString: properties});
thisReturnValue = widget.apply({mode: 'default'}, {selectorString: properties});
thisReturnValue = widget.apply({mode: 'strict'}, {selectorString: properties});
widgetCollection = widget.children();
button = buttonsComposite.children()[0];
button = buttonsComposite.children((candidate: Button) => candidate.text === 'foo')[0];
widgetCollection = widget.children(selector);
fooCollection = widget.children(Foo);
widgetCollection = widget.find();
widgetCollection = widget.find(selector);
fooCollection = widget.find(Foo);
fooCollection = widget.find(Bar);
const test: string = widget.find(Bar)[0].test;

// Events
const target: Composite = widget;
const timeStamp: number = 0;
const type: string = 'foo';
const child: Widget = widgetA;
const index: number = 0;

const addChildEvent: CompositeAddChildEvent = {target, timeStamp, type, child, index};
const removeChildEvent: CompositeRemoveChildEvent = {target, timeStamp, type, child, index};

widget
  .onAddChild((event: CompositeAddChildEvent) => {})
  .onRemoveChild((event: CompositeRemoveChildEvent) => {});

class CustomComponent extends Composite {
  public foo: string;
  constructor(props: Properties<CustomComponent>) {
    super(props);
    this.set(props);
    this.set<CustomComponent>({visible: true, foo: 'bar'});
    this._checkDisposed();
    this._setParent(new Composite());
    this._setParent(new Composite(), 2);
    this._apply({selectorString: properties});
    this._apply({selectorString: Set(Button, {text: 'foo'})});
    this._apply('default', {selectorString: properties});
    this._apply('strict', {selectorString: properties});
  }

  protected _initLayout(param: {layout?: Layout}) {
    super._initLayout();
  }

  protected _acceptChild(child: Widget) {
    return false;
  }

  protected _addChild(widget: Widget, index: number) {
    super._addChild(widget);
  }

  protected _removeChild(widget: Widget) {
    super._removeChild(widget);
  }

}

new CustomComponent({foo: 'bar'}).set({foo: 'bar', visible: true});
