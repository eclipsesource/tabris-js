import { Composite, Action, WidgetCollection, Button } from 'tabris';

const widget: Action = new Action();
widget.appendTo(new Composite());
widget.insertBefore(new Composite());
widget.insertAfter(new Composite());

/*Expected
(4,
not assignable to parameter
(5,
not assignable to parameter
(6,
not assignable to parameter
*/
