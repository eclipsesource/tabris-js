import {Column, ColumnLayout, ConstraintLayout} from 'tabris';

let widget: Column = new Column({layout: new ConstraintLayout()});
widget.layout = new ColumnLayout();
widget.spacing = 23;

/*Expected
(3,
not assignable
(4,
read-only property
(5,
read-only property
*/
