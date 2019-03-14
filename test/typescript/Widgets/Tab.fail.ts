import {Tab, Composite, WidgetCollection, Button} from 'tabris';

let widget: Tab = new Tab();
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
