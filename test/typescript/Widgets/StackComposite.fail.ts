import {StackComposite, StackLayout, ConstraintLayout} from 'tabris';

let widget: StackComposite = new StackComposite({layout: new ConstraintLayout()});
widget.layout = new StackLayout();
widget.spacing = 23;

/*Expected
(3,
not assignable
(4,
read-only property
(5,
read-only property
*/
