import {Stack, StackLayout, ConstraintLayout} from 'tabris';

let widget: Stack = new Stack({layout: new ConstraintLayout()});
widget.layout = new StackLayout();
widget.spacing = 23;

/*Expected
(3,
*/
