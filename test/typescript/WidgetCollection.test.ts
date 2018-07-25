import {WidgetCollection, Transformation, AnimationOptions, Composite, Selector, Widget, BoxDimensions} from 'tabris';

let widgetCollection: WidgetCollection = new WidgetCollection([new Composite()]);

// Properties
let length: number;

length = widgetCollection.length;

// Methods
class Foo extends Composite {
  public bar: string;
}

let fooCollection: WidgetCollection<Foo> = new WidgetCollection([new Foo()]);
let properties: {transform?: Transformation, opacity?: number, bar?: 'bar', padding?: BoxDimensions | number} = {};
let options: AnimationOptions = {};
let parent: Composite = new Composite();
let selector: Selector = '';
let callback: (widget: Widget, index: number, collection: WidgetCollection<Foo>) => void = () => {};
let widget: Widget | undefined;
let foo: Foo | undefined;
let widgetArray: Widget[];
let fooArray: Foo[];
let listener: Function = () => {};
let context: WidgetCollection<Widget>;
let property: string = '';
let value: any;
let Properties: object;
let event: string = '';
let thisReturnValue: WidgetCollection<Foo>;
let voidReturnValue: void;
let anyReturnValue: any;
let booleanReturnValue: boolean;
let numberReturnValue: number;
let undefinedValue: undefined;

voidReturnValue = widgetCollection.animate(properties, options);
thisReturnValue = fooCollection.appendTo(parent);
widgetCollection = widgetCollection.children();
widgetCollection = widgetCollection.children(selector);
fooCollection = widgetCollection.children(Foo);
widgetCollection = fooCollection.children();
widgetCollection = fooCollection.children(selector);
voidReturnValue = widgetCollection.dispose();
widgetCollection = widgetCollection.filter(selector);
fooCollection = fooCollection.filter(selector);
fooCollection = widgetCollection.filter(Foo);
widgetCollection = widgetCollection.find();
widgetCollection = widgetCollection.find(selector);
fooCollection = widgetCollection.find(Foo);
widgetCollection = fooCollection.find();
widgetCollection = fooCollection.find(selector);
widget = widgetCollection.first();
foo = fooCollection.first();
widget = widgetCollection.first(selector);
foo = fooCollection.first(selector);
voidReturnValue = widgetCollection.forEach(callback);
booleanReturnValue = widgetCollection.includes(widget as Widget);
numberReturnValue = widgetCollection.indexOf(widget as Widget);
widget = widgetCollection.last();
foo = fooCollection.last();
widget = widgetCollection.last(selector);
foo = fooCollection.last(selector);
thisReturnValue = fooCollection.off(event, listener);
thisReturnValue = fooCollection.on(event, listener);
thisReturnValue = fooCollection.once(event, listener);
widgetCollection = fooCollection.parent();
thisReturnValue = fooCollection.set(properties);
widgetArray = widgetCollection.toArray();
fooArray = fooCollection.toArray();
thisReturnValue = fooCollection.trigger(event);
widget = widgetCollection[0];
foo = fooCollection[0];
