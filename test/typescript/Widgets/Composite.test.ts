import {Composite, Widget, WidgetCollection} from 'tabris';

let widget: Composite = new Composite();

// Methods
let widgets: Widget[] = [];
let widgetA: Widget = new Widget();
let widgetB: Widget = new Widget();
let widgetCollection: WidgetCollection = new WidgetCollection();
let thisReturnValue: Composite;

thisReturnValue = widget.append(widgetA, widgetB);
thisReturnValue = widget.append(widgets);
thisReturnValue = widget.append(widgetCollection);
