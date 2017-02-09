import {WidgetCollection, Transformation, AnimationOptions, Composite, Selector, Widget} from 'tabris';

let widgetCollection: WidgetCollection;

// Properties
let length: number;

widgetCollection.length = length;

length = widgetCollection.length;

// Methods
let properties: {transform?: Transformation, opacity?: number};
let options: AnimationOptions;
let parent: Composite;
let selector: Selector;
let callback: (widget: Widget, index: number, collection: WidgetCollection) => void;
let widget: Widget;
let widgetArray: Widget[];
let listener: Function;
let context: WidgetCollection;
let property: string;
let Properties: Object;
let event: string;
let thisReturnValue: WidgetCollection;
let voidReturnValue: void;
let anyReturnValue: any;
let booleanReturnValue: boolean;
let numberReturnValue: number;

voidReturnValue = widgetCollection.animate(properties, options);
thisReturnValue = widgetCollection.appendTo(parent);
widgetCollection = widgetCollection.children();
widgetCollection = widgetCollection.children(selector);
voidReturnValue = widgetCollection.dispose();
widgetCollection = widgetCollection.filter(selector);
widgetCollection = widgetCollection.find();
widgetCollection = widgetCollection.find(selector);
widget = widgetCollection.first();
voidReturnValue = widgetCollection.forEach(callback);
booleanReturnValue = widgetCollection.includes(widget);
numberReturnValue = widgetCollection.indexOf(widget);
widget = widgetCollection.last();
thisReturnValue = widgetCollection.off(event, listener);
thisReturnValue = widgetCollection.on(event, listener);
thisReturnValue = widgetCollection.once(event, listener);
widgetCollection = widgetCollection.parent();
thisReturnValue = widgetCollection.set(property);
thisReturnValue = widgetCollection.set(properties);
widgetArray = widgetCollection.toArray();
thisReturnValue = widgetCollection.trigger(event);
anyReturnValue = widgetCollection.get(property);
thisReturnValue = widgetCollection.set(property);
