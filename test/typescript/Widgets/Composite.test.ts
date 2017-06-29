import {Composite, Widget, Button, WidgetCollection} from 'tabris';

let widget: Composite = new Composite();

// Methods
let widgets: Widget[] = [];
let widgetA: Widget = new Button();
let widgetB: Widget = new Button();
let widgetCollection: WidgetCollection<Widget> = new Composite().find();
let thisReturnValue: Composite;

thisReturnValue = widget.append(widgetA, widgetB);
thisReturnValue = widget.append(widgets);
thisReturnValue = widget.append(widgetCollection);

// Events
let index: number;
widget.on({
  addchild: event => {
    widgetA = event.child;
    index = event.index;
  },
  removechild: event => {
    widgetA = event.child;
    index = event.index;
  }
});
