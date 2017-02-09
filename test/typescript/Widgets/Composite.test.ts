import {Composite, Widget, WidgetCollection} from 'tabris';

let widget: Composite;

// Methods
let widgets: Widget[];
let widgetA: Widget;
let widgetB: Widget;
let widgetCollection: WidgetCollection;
let thisReturnValue: Composite;

thisReturnValue = widget.append(widgetA, widgetB);
thisReturnValue = widget.append(widgets);
thisReturnValue = widget.append(widgetCollection);
