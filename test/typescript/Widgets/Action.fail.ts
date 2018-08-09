import {Composite, Action, WidgetCollection, Button} from 'tabris';

let widget: Action = new Action();
widget.appendTo(new Composite());
widget.insertBefore(new Composite());
widget.insertAfter(new Composite());
const siblings: WidgetCollection<Button> = widget.siblings();
widget.siblings(Button);

/*Expected
(4,
not assignable to parameter
(5,
not assignable to parameter
(6,
not assignable to parameter
(7,
is not assignable to type 'WidgetCollection<Button>
(8,
not assignable to parameter
*/