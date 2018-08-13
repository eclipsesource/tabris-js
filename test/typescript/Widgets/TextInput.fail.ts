import {TextInput} from 'tabris';

let widget = new TextInput();

const type = widget.type;
widget.set({type});
widget.type = type;
widget.onTypeChanged(function() {});

/*Expected
(6,
type
(7,
type
(8,
*/
