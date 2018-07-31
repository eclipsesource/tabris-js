import {TextInput} from 'tabris';

let widget = new TextInput();

const type = widget.type;
widget.set({type});
widget.type = type;
widget.onTypeChanged(function() {});

/*Expected
(6,13): error TS2345
'type' does not exist
(7,8): error TS2540: Cannot assign to 'type' because it is a constant or a read-only property
(8,8): error TS2551
*/
