import {Column, ColumnLayout} from 'tabris';

let widget: Column = new Column({layout: ColumnLayout.create()});
widget.layout = ColumnLayout.create();

/*Expected
(3,
not assignable
(4,
read-only property
*/
